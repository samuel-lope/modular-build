/**
 * Classe que define um objeto Retângulo 2D.
 */
export default class Retangulo {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {HTMLElement} coordinatesSpan - O span para exibir as coordenadas.
     * @param {object} config - O objeto de configuração inicial.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, coordinatesSpan, config, openFormCallback, storageKey) {
        this.scene = scene;
        this.coordinatesSpan = coordinatesSpan;
        this.openFormCallback = openFormCallback;
        this.storageKey = storageKey;
        
        this.elementoHTML = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        // Propriedades de estado
        this.isColliding = false;
        this.view = 0; // Ordem de exibição

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
        this.updateAppearance();
    }
    
    /**
     * Cria o elemento DIV no DOM que representa o retângulo.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable', 'object-shape');

        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('mouseup', this.pararArrasto.bind(this));

        this.elementoHTML.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const objectsData = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            const currentData = objectsData.find(d => d.id === this.id);
            if (currentData) {
                this.openFormCallback(currentData, this.type);
            }
        });

        this.scene.appendChild(this.elementoHTML);
    }

    /**
     * Atualiza a aparência visual (posição, tamanho, cor, z-index) do retângulo.
     */
    updateAppearance() {
        if (!this.elementoHTML) return;

        this.elementoHTML.id = this.id;
        this.elementoHTML.style.zIndex = this.view;

        const cssLeft = this.x;
        const cssTop = this.scene.clientHeight - this.y - this.altura;
        this.elementoHTML.style.left = `${cssLeft}px`;
        this.elementoHTML.style.top = `${cssTop}px`;
        
        this.elementoHTML.style.width = `${this.largura}px`;
        this.elementoHTML.style.height = `${this.altura}px`;
        
        this.elementoHTML.style.transformOrigin = '50% 50%';
        this.elementoHTML.style.transform = `rotate(${this.rotation || 0}rad)`;
        
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
        const newCssLeft = event.clientX - sceneRect.left - this.offsetX;
        const newCssTop = event.clientY - sceneRect.top - this.offsetY;

        this.x = Math.round(newCssLeft);
        this.y = Math.round(this.scene.clientHeight - newCssTop - this.altura);

        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - this.largura));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - this.altura));

        this.coordinatesSpan.textContent = `Coordenadas (X, Y): ${this.x}, ${this.y}`;

        const objectsData = (JSON.parse(localStorage.getItem(this.storageKey)) || []).map(d => {
            if (d.id === this.id) {
                return { ...d, x: this.x, y: this.y };
            }
            return d;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(objectsData));
        
        this.updateAppearance();
    }

    pararArrasto() {
        this.isDragging = false;
        this.elementoHTML.style.zIndex = this.view; // Retorna para a view definida
        this.coordinatesSpan.textContent = `Coordenadas (X, Y): ...`;
    }
}

