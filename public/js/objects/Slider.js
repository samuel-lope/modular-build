/**
 * Classe que define um objeto Slider 2D para controlar propriedades de outros objetos.
 */
export default class Slider {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {object} config - O objeto de configuração inicial.
     * @param {Array} allObjectInstances - Array com todas as instâncias de objetos na cena.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, config, allObjectInstances, openFormCallback, storageKey) {
        this.scene = scene;
        this.allObjectInstances = allObjectInstances;
        this.openFormCallback = openFormCallback;
        this.storageKey = storageKey;

        this.elementoHTML = null;
        this.sliderInput = null;
        this.label = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.view = 0;
        this.lastTap = 0;
        this.dragged = false;

        this.criarElemento();
        this.update(config);
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
     * Cria o elemento DIV no DOM que representa o slider.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable', 'object-slider');
        
        this.label = document.createElement('label');
        this.label.classList.add('slider-label');
        
        this.sliderInput = document.createElement('input');
        this.sliderInput.type = 'range';
        this.sliderInput.classList.add('slider-input');

        this.elementoHTML.appendChild(this.label);
        this.elementoHTML.appendChild(this.sliderInput);
        
        // Listeners de mouse
        this.elementoHTML.addEventListener('mousedown', (e) => {
            if (e.target.type !== 'range') this.iniciarArrasto(e);
        });
        this.elementoHTML.addEventListener('dblclick', this.handleDoubleClick.bind(this));

        // Listeners de toque
        this.elementoHTML.addEventListener('touchstart', (e) => {
            if (e.target.type !== 'range') this.iniciarArrasto(e);
        }, { passive: false });
        
        // Listeners globais
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('touchmove', this.arrastar.bind(this), { passive: false });
        
        document.addEventListener('mouseup', this.pararArrasto.bind(this));
        document.addEventListener('touchend', this.pararArrasto.bind(this));
        
        this.sliderInput.addEventListener('input', this.handleSliderInput.bind(this));

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
     * Atualiza a aparência visual (posição, z-index, valores) do slider.
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

        this.label.textContent = `${this.nome}: `;
        this.sliderInput.min = this.min;
        this.sliderInput.max = this.max;

        const targetInstance = this.allObjectInstances.find(obj => obj.id === this.targetId);
        if (targetInstance) {
            let currentValue = targetInstance[this.targetProperty];
            // Converte rotação de radianos para graus para o slider
            if(this.targetProperty === 'rotation') {
                currentValue = (currentValue || 0) * (180 / Math.PI);
            }
            this.sliderInput.value = currentValue;
            this.label.textContent = `${this.nome}: ${Math.round(currentValue)}`;
        }
    }

    /**
     * Lida com a alteração do valor do input do slider.
     */
    handleSliderInput() {
        let newValue = parseFloat(this.sliderInput.value);
        this.label.textContent = `${this.nome}: ${Math.round(newValue)}`;

        const targetInstance = this.allObjectInstances.find(obj => obj.id === this.targetId);
        if (!targetInstance) return;

        // Converte rotação de graus (do slider) para radianos (do objeto)
        let valueToSave = newValue;
        if(this.targetProperty === 'rotation') {
            valueToSave = newValue * (Math.PI / 180);
        }

        const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { theme: {}, objects: [] };
        let updatedConfig = null;
        appData.objects = appData.objects.map(d => {
            if (d.id === this.targetId) {
                updatedConfig = { ...d, [this.targetProperty]: valueToSave };
                return updatedConfig;
            }
            return d;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(appData));
        
        if (updatedConfig) {
            targetInstance.update(updatedConfig);
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
        this.dragged = false;
        this.elementoHTML.style.zIndex = 1000;
        
        const coords = this.getEventCoords(event);
        const rect = this.elementoHTML.getBoundingClientRect();
        this.offsetX = coords.x - rect.left;
        this.offsetY = coords.y - rect.top;
    }

    arrastar(event) {
        if (!this.isDragging) return;
        if (event.type === 'touchmove') event.preventDefault();

        this.dragged = true;
        const coords = this.getEventCoords(event);
        const sceneRect = this.scene.getBoundingClientRect();
        const newCssLeft = coords.x - sceneRect.left - this.offsetX;
        const newCssTop = coords.y - sceneRect.top - this.offsetY;

        this.x = Math.round(newCssLeft);
        this.y = Math.round(this.scene.clientHeight - newCssTop - this.altura);

        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - this.largura));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - this.altura));
        
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

        if (event.type === 'touchend' && !this.dragged) {
            const now = Date.now();
            if (now - this.lastTap < 300) {
                this.handleDoubleClick(event);
            }
            this.lastTap = now;
        }

        this.isDragging = false;
        this.elementoHTML.style.zIndex = this.view; // Retorna para a view definida
    }
}