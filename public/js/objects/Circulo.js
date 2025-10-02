import Objeto2DBase from './Objeto2DBase.js';

/**
 * Classe que define um objeto Círculo 2D, herdando de Objeto2DBase.
 */
export default class Circulo extends Objeto2DBase {
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
        this.elementoHTML.style.borderRadius = '50%';
    }

    /**
     * Atualiza as propriedades do objeto, chamando o método da classe base e tratando as específicas.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        super.update(config); // Atualiza propriedades base (id, x, y, etc.)
        
        // Propriedades específicas do Círculo
        this.diametro = config.diametro;
        this.reactsToCollision = config.reactsToCollision;
        this.collisionHandlers = config.collisionHandlers;
        
        // Propriedades internas para a física de colisão (AABB)
        this.largura = this.diametro;
        this.altura = this.diametro;

        this.updateAppearance();
    }

    /**
     * Atualiza a aparência visual (posição, tamanho, cor, z-index) do círculo.
     */
    updateAppearance() {
        if (!this.elementoHTML) return;

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

