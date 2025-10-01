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
        this.lastTap = 0;
        this.dragged = false;

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
     * Extrai as coordenadas de um evento de mouse ou toque.
     * @param {MouseEvent | TouchEvent} event - O evento do DOM.
     * @returns {{x: number, y: number}} - As coordenadas do cliente.
     */
    getEventCoords(event) {
        if (event.touches && event.touches.length > 0) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        return { x: event.clientX, y: event.clientY };
    }
    
    /**
     * Cria o elemento DIV no DOM que representa o retângulo.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable', 'object-shape');

        // Listeners para mouse
        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        this.elementoHTML.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // Listeners para toque
        this.elementoHTML.addEventListener('touchstart', this.iniciarArrasto.bind(this), { passive: false });
        
        // Listeners globais
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('touchmove', this.arrastar.bind(this), { passive: false });
        
        document.addEventListener('mouseup', this.pararArrasto.bind(this));
        document.addEventListener('touchend', this.pararArrasto.bind(this));

        this.scene.appendChild(this.elementoHTML);
    }
    
    handleDoubleClick(e) {
        e.stopPropagation();
        const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { objects: [] };
        const currentData = appData.objects.find(d => d.id === this.id);
        if (currentData) {
            this.openFormCallback(currentData, this.type);
        }
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
        if (event.type === 'touchstart') event.preventDefault();
        this.isDragging = true;
        this.dragged = false; // Reseta a flag de arrasto
        this.elementoHTML.style.zIndex = 1000;
        
        const coords = this.getEventCoords(event);
        const rect = this.elementoHTML.getBoundingClientRect();
        this.offsetX = coords.x - rect.left;
        this.offsetY = coords.y - rect.top;
    }

    arrastar(event) {
        if (!this.isDragging) return;
        if (event.type === 'touchmove') event.preventDefault();
        
        this.dragged = true; // Marca que o objeto foi realmente arrastado
        const coords = this.getEventCoords(event);
        const sceneRect = this.scene.getBoundingClientRect();
        const newCssLeft = coords.x - sceneRect.left - this.offsetX;
        const newCssTop = coords.y - sceneRect.top - this.offsetY;

        this.x = Math.round(newCssLeft);
        this.y = Math.round(this.scene.clientHeight - newCssTop - this.altura);

        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - this.largura));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - this.altura));

        this.coordinatesSpan.textContent = `X, Y: ${this.x}, ${this.y}`;

        const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { theme: {}, objects: [] };
        appData.objects = appData.objects.map(d => {
            if (d.id === this.id) {
                return { ...d, x: this.x, y: this.y };
            }
            return d;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(appData));
        
        this.updateAppearance();
    }

    pararArrasto(event) {
        if (!this.isDragging) return;

        // Lógica de Toque Duplo para mobile
        if (event.type === 'touchend' && !this.dragged) {
            const now = Date.now();
            if (now - this.lastTap < 300) { // Limite de 300ms para toque duplo
                this.handleDoubleClick(event);
            }
            this.lastTap = now;
        }
        
        this.isDragging = false;
        this.elementoHTML.style.zIndex = this.view; // Retorna para a view definida
        
        if (this.coordinatesSpan) {
            this.coordinatesSpan.textContent = `X, Y: ...`;
        }
    }
}