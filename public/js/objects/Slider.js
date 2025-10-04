import Objeto2DBase from './Objeto2DBase.js';

/**
 * Classe que define um objeto Slider 2D, herdando de Objeto2DBase.
 */
export default class Slider extends Objeto2DBase {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {object} config - O objeto de configuração inicial.
     * @param {Array} allObjectInstances - Array com todas as instâncias de objetos na cena.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, config, allObjectInstances, openFormCallback, storageKey) {
        super(scene, config, openFormCallback, storageKey);
        this.allObjectInstances = allObjectInstances;

        this.sliderInput = null;
        this.label = null;
        
        // Dimensões fixas para o slider
        this.largura = 300;
        this.altura = 50;

        this.criarElemento();
        this.update(config);
    }
    
    /**
     * Cria o elemento, chamando o método da classe base e adicionando os elementos do slider.
     */
    criarElemento() {
        super.criarElemento(); // Cria o container base e anexa listeners de arrasto
        this.elementoHTML.classList.add('object-slider');

        this.label = document.createElement('label');
        this.label.classList.add('slider-label');
        
        this.sliderInput = document.createElement('input');
        this.sliderInput.type = 'range';
        this.sliderInput.classList.add('slider-input');

        this.elementoHTML.appendChild(this.label);
        this.elementoHTML.appendChild(this.sliderInput);

        this.sliderInput.addEventListener('input', this.handleSliderInput.bind(this));
    }
    
    /**
     * Atualiza as propriedades do objeto, chamando o método da classe base e tratando as específicas.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        super.update(config); // Atualiza propriedades base (id, x, y, etc.)

        // Propriedades específicas do Slider
        this.targetId = config.targetId;
        this.targetProperty = config.targetProperty;
        this.min = config.min;
        this.max = config.max;
        
        // **NOVO**: Propriedade para herança de valor
        this.inheritedSliderId = config.inheritedSliderId || null;

        this.updateAppearance();
        this.updateInputState(); // **NOVO**: Atualiza o estado do input (ativado/desativado)
    }
    
    /**
     * **NOVO**: Ativa ou desativa o input do slider com base na herança.
     */
    updateInputState() {
        if (this.inheritedSliderId) {
            this.sliderInput.disabled = true;
            this.elementoHTML.style.opacity = '0.7'; // Feedback visual de que está desativado
            this.elementoHTML.title = `Valor herdado do slider ${this.inheritedSliderId}`;
        } else {
            this.sliderInput.disabled = false;
            this.elementoHTML.style.opacity = '1';
            this.elementoHTML.title = '';
        }
    }


    /**
     * Atualiza a aparência visual (posição, z-index, valores) do slider.
     */
    updateAppearance() {
        if (!this.elementoHTML) return;

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
        
        // Se não estiver herdando, busca o valor do seu objeto alvo para se posicionar
        if (!this.inheritedSliderId && targetInstance) {
            let currentValue = targetInstance[this.targetProperty];
            // Converte rotação de radianos para graus para o slider
            if(this.targetProperty === 'rotation') {
                currentValue = (currentValue || 0) * (180 / Math.PI);
            }
            this.sliderInput.value = currentValue;
            this.label.textContent = `${this.nome}: ${Math.round(currentValue)}`;
        } else {
            // Se estiver herdando, o valor é definido pelo gameLoop, aqui apenas exibimos.
            this.label.textContent = `${this.nome}: ${Math.round(this.sliderInput.value)}`;
        }
    }

    /**
     * Lida com a alteração do valor do input do slider.
     * Esta função é agora chamada tanto pela interação do utilizador (se não herdado)
     * como programaticamente pelo gameLoop (se herdado).
     */
    handleSliderInput() {
        let newValue = parseFloat(this.sliderInput.value);
        this.label.textContent = `${this.nome}: ${Math.round(newValue)}`;

        const targetInstance = this.allObjectInstances.find(obj => obj.id === this.targetId);
        if (!targetInstance) return;

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

            if (targetInstance.type === 'grupo') {
                const groupData = JSON.parse(localStorage.getItem(this.storageKey)) || { theme: {}, objects: [] };
                groupData.objects = groupData.objects.map(d => {
                    const childInGroup = targetInstance.childObjects.find(c => c.id === d.id);
                    if (childInGroup) {
                        return { ...d, x: childInGroup.x, y: childInGroup.y };
                    }
                    return d;
                });
                localStorage.setItem(this.storageKey, JSON.stringify(groupData));
            }
        }
    }
}

