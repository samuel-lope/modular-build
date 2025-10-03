import Retangulo from './Retangulo.js';

/**
 * Classe que define um objeto Condicional 2D.
 * Herda a aparência e o comportamento base de um Retângulo, mas adiciona
 * uma lógica condicional que pode alterar sua própria aparência com base
 * no estado de outro objeto na cena.
 */
export default class Condicional extends Retangulo {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {HTMLElement} coordinatesSpan - O span para exibir as coordenadas.
     * @param {object} config - O objeto de configuração inicial.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, coordinatesSpan, config, openFormCallback, storageKey) {
        // Chama o construtor da classe pai (Retangulo)
        super(scene, coordinatesSpan, config, openFormCallback, storageKey);

        this.update(config); // Garante que a lógica condicional seja configurada

        // Propriedades para armazenar o estado original antes da transformação
        this.originalColor = this.collisionHandlers.onNoCollision.cor;
        this.originalPosition = { x: this.x, y: this.y };
        this.isTransformed = false;
    }

    /**
     * Atualiza as propriedades do objeto, estendendo o método da classe Retangulo.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        super.update(config); // Atualiza propriedades do Retângulo (tamanho, cor, etc.)

        // Propriedades específicas da lógica condicional
        this.conditionTargetId = config.conditionTargetId || null;
        this.conditionProperty = config.conditionProperty || 'x';
        this.conditionOperator = config.conditionOperator || '==';
        this.conditionValue = config.conditionValue !== undefined ? config.conditionValue : 0;
        this.transformationType = config.transformationType || 'changeColor';
        this.transformationValue = config.transformationValue || { color: 'rgba(255, 255, 0, 1)' };

        // Armazena o estado original para poder reverter a transformação
        this.originalColor = this.collisionHandlers.onNoCollision.cor;
        this.originalPosition = { x: this.x, y: this.y };
        this.isTransformed = false; // Reseta o estado de transformação ao atualizar
    }

    /**
     * Verifica se a condição definida foi atendida pelo objeto alvo.
     * @param {Objeto2DBase} targetObject - A instância do objeto a ser monitorado.
     * @returns {boolean} - Verdadeiro se a condição for atendida, falso caso contrário.
     */
    checkCondition(targetObject) {
        if (!targetObject) return false;

        const targetValue = targetObject[this.conditionProperty];
        const conditionValue = this.conditionValue;

        switch (this.conditionOperator) {
            case '==': return targetValue == conditionValue;
            case '!=': return targetValue != conditionValue;
            case '>': return targetValue > conditionValue;
            case '<': return targetValue < conditionValue;
            case '>=': return targetValue >= conditionValue;
            case '<=': return targetValue <= conditionValue;
            default: return false;
        }
    }

    /**
     * Aplica a transformação visual a este objeto se a condição for atendida.
     */
    applyTransformation() {
        if (this.isTransformed) return; // Evita aplicar a transformação repetidamente

        if (this.transformationType === 'changeColor') {
            this.elementoHTML.style.backgroundColor = this.transformationValue.color;
        } else if (this.transformationType === 'changePosition') {
            this.x = this.transformationValue.x;
            this.y = this.transformationValue.y;
            super.updateAppearance(); // Usa o updateAppearance da classe pai
        }
        this.isTransformed = true;
    }

    /**
     * Reverte a transformação, restaurando o estado visual original do objeto.
     */
    resetTransformation() {
        if (!this.isTransformed) return; // Evita reverter repetidamente

        // A cor de colisão tem prioridade sobre a transformação de cor
        const baseColor = this.isColliding 
            ? this.collisionHandlers.onCollision.cor 
            : this.originalColor;

        if (this.transformationType === 'changeColor') {
             this.elementoHTML.style.backgroundColor = baseColor;
        } else if (this.transformationType === 'changePosition') {
            this.x = this.originalPosition.x;
            this.y = this.originalPosition.y;
            super.updateAppearance();
        }
        
        // Se não houver colisão, a cor de fundo deve ser a original
        if (!this.isColliding) {
             this.elementoHTML.style.backgroundColor = this.originalColor;
        }

        this.isTransformed = false;
    }

    /**
     * Sobrescreve a atualização de aparência para considerar o estado de transformação.
     */
    updateAppearance() {
        // Chama a implementação da classe pai (Retangulo)
        super.updateAppearance();

        // Se o objeto já estiver transformado, reaplica a transformação
        // para garantir que ela persista sobre outras atualizações.
        if (this.isTransformed) {
            if (this.transformationType === 'changeColor' && !this.isColliding) {
                this.elementoHTML.style.backgroundColor = this.transformationValue.color;
            }
        }
    }
}

