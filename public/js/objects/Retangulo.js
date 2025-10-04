import Objeto2DBase from './Objeto2DBase.js';

/**
 * Classe que define um objeto Retângulo 2D, herdando de Objeto2DBase.
 */
export default class Retangulo extends Objeto2DBase {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {HTMLElement} coordinatesSpan - O span para exibir as coordenadas.
     * @param {object} config - O objeto de configuração inicial.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, coordinatesSpan, config, openFormCallback, storageKey) {
        super(scene, config, openFormCallback, storageKey);
        this.coordinatesSpan = coordinatesSpan;

        // Propriedades de estado específicas
        this.isColliding = false;

        this.criarElemento();
        this.update(config);
    }

    /**
     * Cria o elemento, chamando o método da classe base e adicionando estilos específicos.
     */
    criarElemento() {
        super.criarElemento(); // Cria o elemento base e anexa listeners
        this.elementoHTML.classList.add('object-shape');
    }

    /**
     * Atualiza as propriedades do objeto, chamando o método da classe base e tratando as específicas.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        super.update(config); // Atualiza propriedades base (id, x, y, etc.)
        
        // Propriedades específicas do Retângulo
        this.largura = config.largura;
        this.altura = config.altura;
        this.rotation = config.rotation || 0;
        this.reactsToCollision = config.reactsToCollision;
        this.collisionHandlers = config.collisionHandlers;

        this.updateAppearance();
    }

    /**
     * Atualiza a aparência visual (posição, tamanho, cor, z-index) do retângulo.
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
        
        this.elementoHTML.style.transformOrigin = '50% 50%'; // Rotation Point of the Rectangle
        this.elementoHTML.style.transform = `rotate(${this.rotation}rad)`;
        
        const corAtual = this.isColliding 
            ? this.collisionHandlers.onCollision.cor
            : this.collisionHandlers.onNoCollision.cor;
            
        if (this.elementoHTML.style.backgroundColor !== corAtual) {
            this.elementoHTML.style.backgroundColor = corAtual;
        }
    }
    
    // Sobrescreve o método arrastar para atualizar as coordenadas na UI
    arrastar(event) {
        super.arrastar(event); // Executa a lógica de arrasto da classe base
        if (this.isDragging) {
            this.coordinatesSpan.textContent = `Coordenadas (X, Y): ${this.x}, ${this.y}`;
        }
    }

    // Sobrescreve o método para limpar as coordenadas na UI
    pararArrasto() {
        super.pararArrasto();
        this.coordinatesSpan.textContent = `Coordenadas (X, Y): ...`;
    }
}

