/**
 * Classe que define um objeto Retângulo 2D.
 * Todas as suas características e comportamentos estão encapsulados aqui.
 */
export default class Retangulo {
    /**
     * @param {HTMLElement} scene - O elemento do palco onde o retângulo será adicionado.
     * @param {HTMLElement} coordinatesElement - O elemento span para exibir as coordenadas.
     * @param {number} x - Posição inicial no eixo X.
     * @param {number} y - Posição inicial no eixo Y.
     * @param {number} largura - Largura do retângulo.
     * @param {number} altura - Altura do retângulo.
     * @param {string} cor - Cor inicial de preenchimento (classe do Tailwind CSS, ex: 'bg-blue-500').
     * @param {object} eixoGiro - Ponto de pivô para rotação {x, y} em percentual (0 a 1), onde {x:0.5, y:0.5} é o centro.
     * @param {number} rotation - Rotação inicial do objeto em radianos.
     * @param {object} collisionHandlers - Objeto que define o comportamento em caso de colisão. Ex: { onCollision: { cor: '...' }, onNoCollision: { cor: '...' } }
     */
    constructor(scene, coordinatesElement, x, y, largura, altura, cor, eixoGiro = { x: 0.5, y: 0.5 }, rotation = 0, collisionHandlers = null) {
        this.scene = scene;
        this.coordinatesElement = coordinatesElement;
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
        this.cor = cor;
        this.eixoGiro = eixoGiro;
        this.rotation = rotation;
        this.collisionHandlers = collisionHandlers;

        this.elementoHTML = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.isColliding = false; // Novo estado para controlar a colisão

        this.criarElemento();
    }

    /**
     * Cria o elemento DIV no DOM que representa o retângulo e adiciona os eventos de mouse.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable', this.cor);
        this.elementoHTML.style.width = `${this.largura}px`;
        this.elementoHTML.style.height = `${this.altura}px`;
        
        this.elementoHTML.style.transformOrigin = `${this.eixoGiro.x * 100}% ${this.eixoGiro.y * 100}%`;

        this.scene.appendChild(this.elementoHTML);

        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('mouseup', this.pararArrasto.bind(this));

        this.atualizarPosicaoVisual();
        if (this.coordinatesElement.textContent === '...') {
             this.atualizarDisplayCoordenadas();
        }
    }
    
    /**
     * Converte as coordenadas do nosso sistema (0,0 no canto inferior esquerdo)
     * para o sistema de posicionamento do CSS (0,0 no canto superior esquerdo).
     */
    atualizarPosicaoVisual() {
        if (!this.elementoHTML) return;

        const cssLeft = this.x;
        const cssTop = this.scene.clientHeight - this.y - this.altura;

        this.elementoHTML.style.left = `${cssLeft}px`;
        this.elementoHTML.style.top = `${cssTop}px`;
        this.elementoHTML.style.transform = `rotate(${this.rotation}rad)`;
    }
    
    /**
     * Atualiza a aparência do objeto com base no seu estado de colisão.
     * Este método é chamado a cada frame pelo gameLoop.
     */
    updateAppearance() {
        // Se não houver handlers de colisão para este objeto, não faz nada.
        if (!this.collisionHandlers) return;

        let newCor = null;
        // Verifica qual cor deve ser aplicada com base no estado de colisão
        if (this.isColliding && this.collisionHandlers.onCollision?.cor) {
            newCor = this.collisionHandlers.onCollision.cor;
        } else if (!this.isColliding && this.collisionHandlers.onNoCollision?.cor) {
            newCor = this.collisionHandlers.onNoCollision.cor;
        }

        // Se a cor calculada for diferente da cor atual, aplica a nova cor.
        // Isso evita manipulação desnecessária do DOM.
        if (newCor && this.cor !== newCor) {
            this.elementoHTML.classList.remove(this.cor);
            this.cor = newCor;
            this.elementoHTML.classList.add(this.cor);
        }
    }

    /**
     * Atualiza o texto que exibe as coordenadas atuais do objeto.
     */
    atualizarDisplayCoordenadas() {
        this.coordinatesElement.textContent = `${Math.round(this.x)}, ${Math.round(this.y)}`;
    }

    // --- FUNÇÕES DE EVENTO (DRAG AND DROP) ---

    iniciarArrasto(event) {
        this.isDragging = true;
        this.elementoHTML.style.zIndex = 1000;

        const rect = this.elementoHTML.getBoundingClientRect();
        this.offsetX = event.clientX - rect.left;
        
        const mouseYInScene = this.scene.clientHeight - event.clientY;
        this.offsetY = mouseYInScene - this.y;
    }



    arrastar(event) {
        if (!this.isDragging) return;
        event.preventDefault();

        this.x = event.clientX - this.offsetX;
        const mouseYInScene = this.scene.clientHeight - event.clientY;
        this.y = mouseYInScene - this.offsetY;

        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - this.largura));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - this.altura));

        this.atualizarPosicaoVisual();
        this.atualizarDisplayCoordenadas();
    }

    pararArrasto() {
        this.isDragging = false;
        this.elementoHTML.style.zIndex = 1;
    }
}

