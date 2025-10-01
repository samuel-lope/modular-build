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
        this.view = 0; // Ordem de exibição

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

        this.elementoHTML.addEventListener('mousedown', (e) => {
            if (e.target.type !== 'range') { // Só arrasta se não for o controle do slider
                this.iniciarArrasto(e);
            }
        });
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('mouseup', this.pararArrasto.bind(this));
        
        this.sliderInput.addEventListener('input', this.handleSliderInput.bind(this));
        
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
                currentValue = currentValue * (180 / Math.PI);
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

        const objectsData = (JSON.parse(localStorage.getItem(this.storageKey)) || []).map(d => {
            if (d.id === this.targetId) {
                return { ...d, [this.targetProperty]: valueToSave };
            }
            return d;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(objectsData));
        
        targetInstance.update(objectsData.find(d => d.id === this.targetId));
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
    }
}

