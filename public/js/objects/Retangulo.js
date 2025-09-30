/**
 * Classe que define um objeto Retângulo 2D.
 */
export default class Retangulo {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {HTMLElement} coordinatesElement - O elemento span para exibir as coordenadas.
     * @param {object} config - O objeto de configuração com todas as propriedades.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, coordinatesElement, config, openFormCallback, storageKey) {
        this.scene = scene;
        this.coordinatesElement = coordinatesElement;
        this.openFormCallback = openFormCallback;
        this.storageKey = storageKey;
        
        this.elementoHTML = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isColliding = false;

        this.criarElemento();
        this.update(config);
    }

    /**
     * Atualiza as propriedades do objeto a partir de um novo objeto de configuração.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        this.id = config.id;
        this.nome = config.nome;
        this.x = config.x;
        this.y = config.y;
        this.largura = config.largura;
        this.altura = config.altura;
        this.rotation = config.rotation;
        this.reactsToCollision = config.reactsToCollision;
        this.collisionHandlers = config.collisionHandlers;
        this.cor = this.collisionHandlers.onNoCollision.cor;
        
        if(this.elementoHTML) {
            this.atualizarPosicaoVisual();
            this.updateAppearance();
        }
    }

    /**
     * Cria o elemento DIV no DOM que representa o retângulo.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable');
        
        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('mouseup', this.pararArrasto.bind(this));
        this.elementoHTML.addEventListener('dblclick', () => {
            const objectsData = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            const currentData = objectsData.find(d => d.id === this.id);
            if (currentData) {
                this.openFormCallback(currentData);
            }
        });

        this.scene.appendChild(this.elementoHTML);
    }
    
    /**
     * Atualiza a posição, tamanho e rotação do elemento no DOM.
     */
    atualizarPosicaoVisual() {
        if (!this.elementoHTML) return;

        this.elementoHTML.id = this.id;

        const cssLeft = this.x;
        const cssTop = this.scene.clientHeight - this.y - this.altura;

        this.elementoHTML.style.left = `${cssLeft}px`;
        this.elementoHTML.style.top = `${cssTop}px`;
        this.elementoHTML.style.width = `${this.largura}px`;
        this.elementoHTML.style.height = `${this.altura}px`;
        this.elementoHTML.style.transformOrigin = `50% 50%`;
        this.elementoHTML.style.transform = `rotate(${this.rotation}rad)`;
    }
    
    /**
     * Atualiza a cor do objeto com base no seu estado de colisão.
     */
    updateAppearance() {
        if (!this.collisionHandlers) return;
        
        let targetCor;

        if (!this.reactsToCollision) {
            // Se não reage, a cor é sempre a padrão.
            targetCor = this.collisionHandlers.onNoCollision.cor;
        } else {
            // Se reage, a cor depende do estado de colisão.
            targetCor = this.isColliding 
                ? this.collisionHandlers.onCollision.cor 
                : this.collisionHandlers.onNoCollision.cor;
        }

        // CORREÇÃO: A verificação agora compara a cor do elemento DOM com a cor alvo.
        // Isso garante que a cor inicial seja aplicada, já que o estilo do elemento
        // estará vazio no começo ("") e será diferente da cor alvo.
        if (this.elementoHTML.style.backgroundColor !== targetCor) {
            this.elementoHTML.style.backgroundColor = targetCor;
        }
        
        // Mantém a propriedade interna de cor em sincronia.
        this.cor = targetCor;
    }


    /**
     * Remove o elemento do objeto do DOM.
     */
    destroy() {
        if (this.elementoHTML) {
            this.elementoHTML.remove();
        }
    }

    /**
     * Atualiza o texto que exibe as coordenadas.
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
        this.offsetY = event.clientY - rect.top;
    }

    arrastar(event) {
        if (!this.isDragging) return;
        event.preventDefault();

        const sceneRect = this.scene.getBoundingClientRect();
        const newCssLeft = event.clientX - sceneRect.left - this.offsetX;
        const newCssTop = event.clientY - sceneRect.top - this.offsetY;

        this.x = Math.round(newCssLeft);
        this.y = Math.round(this.scene.clientHeight - newCssTop - this.altura);

        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - this.largura));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - this.altura));
        
        const objectsData = (JSON.parse(localStorage.getItem(this.storageKey)) || []).map(d => {
            if (d.id === this.id) {
                return { ...d, x: this.x, y: this.y };
            }
            return d;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(objectsData));

        this.atualizarPosicaoVisual();
        this.atualizarDisplayCoordenadas();
    }

    pararArrasto() {
        this.isDragging = false;
        this.elementoHTML.style.zIndex = 1;
    }
}

