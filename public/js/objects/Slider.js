/**
 * Classe que define um objeto Slider 2D.
 */
export default class Slider {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {object} config - O objeto de configuração.
     * @param {Array} allObjects - Referência ao array de todas as instâncias de objetos.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, config, allObjects, openFormCallback, storageKey) {
        this.scene = scene;
        this.allObjects = allObjects;
        this.openFormCallback = openFormCallback;
        this.storageKey = storageKey;
        
        this.elementoHTML = null;
        this.sliderInput = null;
        this.valueDisplay = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.largura = 300;
        this.altura = 50;

        this.criarElemento();
        this.update(config);
    }

    /**
     * Atualiza as propriedades do objeto a partir de um novo objeto de configuração.
     * Este método é chamado na criação e na edição do objeto.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        Object.assign(this, config);
        
        if(this.elementoHTML) {
            this.atualizarPosicaoVisual();
            this.updateAppearance(); // Apenas atualiza a aparência do slider em si
        }
    }

    /**
     * Cria o elemento DIV no DOM que representa o slider.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable', 'slider-container');
        
        const label = document.createElement('label');
        this.valueDisplay = document.createElement('span');
        
        const labelContainer = document.createElement('div');
        labelContainer.className = 'flex justify-between items-center';
        labelContainer.appendChild(label);
        labelContainer.appendChild(this.valueDisplay);

        this.sliderInput = document.createElement('input');
        this.sliderInput.type = 'range';
        
        this.elementoHTML.appendChild(labelContainer);
        this.elementoHTML.appendChild(this.sliderInput);

        this.sliderInput.addEventListener('mousedown', (e) => e.stopPropagation());
        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('mouseup', this.pararArrasto.bind(this));
        
        this.sliderInput.addEventListener('input', this.handleSliderInput.bind(this));

        this.elementoHTML.addEventListener('dblclick', (e) => {
            e.stopPropagation(); // Impede que o evento se propague para a cena
            const objectsData = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            const currentData = objectsData.find(d => d.id === this.id);
            if (currentData) {
                this.openFormCallback(currentData, this.type);
            }
        });

        this.scene.appendChild(this.elementoHTML);
    }
    
    /**
     * Atualiza a posição visual do container do slider.
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
    }
    
    /**
     * Atualiza a aparência (label, min/max, valor) do slider para refletir seu estado atual.
     * Ele lê o valor do objeto alvo para definir sua posição inicial.
     */
    updateAppearance() {
        if (!this.sliderInput) return;
        
        const label = this.elementoHTML.querySelector('label');
        label.textContent = this.nome;
        
        this.sliderInput.min = this.min;
        this.sliderInput.max = this.max;
        this.sliderInput.step = this.targetProperty === 'rotation' ? 1 : 0.1;
        
        const targetInstance = this.allObjects.find(obj => obj.id === this.targetId);
        if (targetInstance) {
            let currentValue = targetInstance[this.targetProperty];
            if (this.targetProperty === 'rotation') {
                currentValue = (currentValue || 0) * (180 / Math.PI);
            }
            this.sliderInput.value = currentValue;
            this.valueDisplay.textContent = Math.round(currentValue);
        } else {
             this.valueDisplay.textContent = '---';
        }
    }
    
    /**
     * Chamado quando o usuário move o slider.
     * Encontra o objeto alvo, atualiza sua propriedade e salva o estado.
     */
    handleSliderInput() {
        const targetInstance = this.allObjects.find(obj => obj.id === this.targetId);
        if (!targetInstance) return;

        let value = parseFloat(this.sliderInput.value);
        this.valueDisplay.textContent = Math.round(value);

        let objectsData = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        const targetDataIndex = objectsData.findIndex(d => d.id === this.targetId);
        
        if (targetDataIndex === -1) return;
        
        let updatedTargetData = { ...objectsData[targetDataIndex] };
        const valueToApply = this.targetProperty === 'rotation' ? value * (Math.PI / 180) : value;

        updatedTargetData[this.targetProperty] = valueToApply;
        
        targetInstance.update(updatedTargetData);

        objectsData[targetDataIndex] = updatedTargetData;
        localStorage.setItem(this.storageKey, JSON.stringify(objectsData));
    }

    destroy() {
        if (this.elementoHTML) this.elementoHTML.remove();
    }

    // --- DRAG AND DROP ---
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
    }

    pararArrasto() {
        this.isDragging = false;
        this.elementoHTML.style.zIndex = 1;
    }
}

