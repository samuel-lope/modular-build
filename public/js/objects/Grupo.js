import Objeto2DBase from './Objeto2DBase.js';

/**
 * Classe que define um Grupo lógico de objetos.
 * Este objeto não possui uma representação visual direta, mas atua como um contêiner
 * para controlar múltiplos objetos como uma única unidade.
 */
export default class Grupo extends Objeto2DBase {
    /**
     * @param {object} config - O objeto de configuração inicial.
     * @param {Array} allObjectInstances - Array com todas as instâncias de objetos na cena.
     */
    constructor(config, allObjectInstances) {
        // O Grupo não tem elemento de cena ou callbacks de formulário como os outros
        super(null, config, null, null);
        this.allObjectInstances = allObjectInstances;

        // Propriedades específicas do Grupo
        this.childIds = config.childIds || [];
        this.childObjects = [];

        this.update(config);
        this.resolveChildren();
    }

    /**
     * Encontra e armazena as instâncias reais dos objetos filhos.
     */
    resolveChildren() {
        this.childObjects = this.childIds
            .map(id => this.allObjectInstances.find(obj => obj.id === id))
            .filter(Boolean); // Filtra qualquer filho não encontrado
    }

    /**
     * Atualiza as propriedades do grupo.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        const oldX = this.x;
        const oldY = this.y;

        // Atualiza as propriedades do grupo (incluindo x e y) com os valores do formulário
        super.update(config);
        
        // Calcula a diferença (delta) que o grupo se moveu
        const deltaX = this.x - oldX;
        const deltaY = this.y - oldY;

        // Se houve movimento, aplica o delta diretamente aos filhos
        if (deltaX !== 0 || deltaY !== 0) {
            for (const child of this.childObjects) {
                child.x += deltaX;
                child.y += deltaY;
                child.updateAppearance();
            }
        }

        this.childIds = config.childIds || [];
        if (this.allObjectInstances) {
            this.resolveChildren();
        }
    }

    /**
     * Move o grupo e todos os seus filhos por um determinado deslocamento.
     * @param {number} deltaX - A mudança na posição X.
     * @param {number} deltaY - A mudança na posição Y.
     */
    moveBy(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        for (const child of this.childObjects) {
            child.x += deltaX;
            child.y += deltaY;
            child.updateAppearance(); // Força a atualização visual do filho
        }
    }
    
    /**
     * O Grupo não tem aparência visual, então este método é sobrescrito para não fazer nada.
     */
    updateAppearance() {
        // Intencionalmente vazio
    }

    /**
     * O Grupo não pode ser arrastado diretamente, então os métodos de arrasto são desabilitados.
     */
    iniciarArrasto(event) { /* Não faz nada */ }
    arrastar(event) { /* Não faz nada */ }
    pararArrasto() { /* Não faz nada */ }
}
