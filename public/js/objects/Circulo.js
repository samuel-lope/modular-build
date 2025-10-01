/**
 * Classe que define um objeto Círculo 2D.
 */
export default class Circulo {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {HTMLElement} coordinatesSpan - O span para exibir as coordenadas.
     * @param {object} config - O objeto de configuração inicial.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     * @param {Array} allObjectInstances - Referência ao array com todas as instâncias de objetos.
     * @param {Function} collisionChecker - A função que verifica colisão AABB.
     */
    constructor(scene, coordinatesSpan, config, openFormCallback, storageKey) {
        this.scene = scene;
        this.coordinatesSpan = coordinatesSpan;
        this.openFormCallback = openFormCallback;
        this.storageKey = storageKey;

        // Removido: allObjectInstances e collisionChecker não são mais passados aqui
        this.allObjectInstances = null; // Será injetado depois se necessário
        this.collisionChecker = null; // Será injetado depois se necessário
        
        this.elementoHTML = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        // Propriedades de estado
        this.isColliding = false;
        this.view = 0; // Ordem de exibição
        this.isObstacle = false;

        this.criarElemento();
        this.update(config); // Aplica a configuração inicial
    }

    /**
     * Atualiza as propriedades do objeto a partir de um novo objeto de configuração.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        Object.assign(this, config);
        this.view = config.view || 0; // Garante que a view seja definida
        this.isObstacle = config.isObstacle || false;
        
        // Para a lógica de colisão (AABB), tratamos largura e altura como o diâmetro.
        this.largura = this.diametro;
        this.altura = this.diametro;

        this.updateAppearance();
    }
    
    /**
     * Cria o elemento DIV no DOM que representa o círculo.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable', 'object-shape');
        this.elementoHTML.style.borderRadius = '50%';

        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('mouseup', this.pararArrasto.bind(this));

        this.elementoHTML.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { objects: [] };
            const currentData = appData.objects.find(d => d.id === this.id);
            if (currentData) {
                this.openFormCallback(currentData, this.type);
            }
        });

        this.scene.appendChild(this.elementoHTML);
    }

    /**
     * Atualiza a aparência visual (posição, tamanho, cor, z-index) do círculo.
     */
    updateAppearance() {
        if (!this.elementoHTML) return;

        this.elementoHTML.id = this.id;
        this.elementoHTML.style.zIndex = this.view;

        const cssLeft = this.x;
        const cssTop = this.scene.clientHeight - this.y - this.diametro;
        this.elementoHTML.style.left = `${cssLeft}px`;
        this.elementoHTML.style.top = `${cssTop}px`;
        
        this.elementoHTML.style.width = `${this.diametro}px`;
        this.elementoHTML.style.height = `${this.diametro}px`;
        
        const corAtual = this.isColliding 
            ? this.collisionHandlers.onCollision.cor
            : this.collisionHandlers.onNoCollision.cor;
            
        if (this.elementoHTML.style.backgroundColor !== corAtual) {
            this.elementoHTML.style.backgroundColor = corAtual;
        }
    }

    /**
     * Remove o elemento do DOM.
     */
    destroy() {
        if (this.elementoHTML) this.elementoHTML.remove();
    }

    // --- LÓGICA DE DRAG AND DROP ---
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
        const obstacles = this.allObjectInstances.filter(obj => obj.isObstacle && obj.id !== this.id);
        
        // Posição desejada pelo mouse
        let newCssLeft = event.clientX - sceneRect.left - this.offsetX;
        let newX = Math.round(newCssLeft);

        let newCssTop = event.clientY - sceneRect.top - this.offsetY;
        let newY = Math.round(this.scene.clientHeight - newCssTop - this.diametro);

        // Verifica colisão no eixo X
        let canMoveX = true;
        for (const obstacle of obstacles) {
            const simulatedBounds = { x: newX, y: this.y, largura: this.diametro, altura: this.diametro };
            if (this.collisionChecker(simulatedBounds, obstacle)) {
                canMoveX = false;
                break;
            }
        }
        if (canMoveX) {
            this.x = newX;
        }

        // Verifica colisão no eixo Y
        let canMoveY = true;
        for (const obstacle of obstacles) {
            const simulatedBounds = { x: this.x, y: newY, largura: this.diametro, altura: this.diametro };
            if (this.collisionChecker(simulatedBounds, obstacle)) {
                canMoveY = false;
                break;
            }
        }
        if (canMoveY) {
            this.y = newY;
        }

        // Garante que o objeto não saia da tela
        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - this.diametro));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - this.diametro));

        this.coordinatesSpan.textContent = `Coordenadas (X, Y): ${this.x}, ${this.y}`;
        
        this.updateAppearance();
    }

    pararArrasto() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.elementoHTML.style.zIndex = this.view; // Retorna para a view definida
        this.coordinatesSpan.textContent = `Coordenadas (X, Y): ...`;

        // Salva a posição final no localStorage
        const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { theme: {}, objects: [] };
        appData.objects = appData.objects.map(d => {
            if (d.id === this.id) {
                return { ...d, x: this.x, y: this.y };
            }
            return d;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(appData));
    }
}

