/**
 * Classe que define um objeto Círculo 2D.
 * É funcionalmente similar ao Retângulo, mas renderizado como um círculo.
 */
export default class Circulo {
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

        this.criarElemento();
        this.update(config); // Aplica a configuração inicial
    }

    /**
     * Atualiza as propriedades do objeto a partir de um novo objeto de configuração.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        Object.assign(this, config);
        
        // Para a lógica de colisão (AABB), tratamos largura e altura como o diâmetro.
        this.largura = this.diametro;
        this.altura = this.diametro;

        this.updateAppearance();
    }
    
    /**
     * Cria o elemento DIV no DOM que representa o círculo.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.classList.add('draggable', 'object-shape');
        this.elementoHTML.style.borderRadius = '50%'; // A mágica acontece aqui!

        // Adiciona os listeners de eventos
        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('mouseup', this.pararArrasto.bind(this));

        // Listener para abrir o formulário de edição
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
     * Atualiza a aparência visual (posição, tamanho, cor) do círculo.
     */
    updateAppearance() {
        if (!this.elementoHTML) return;

        this.elementoHTML.id = this.id;

        // Posição
        const cssLeft = this.x;
        const cssTop = this.scene.clientHeight - this.y - this.diametro;
        this.elementoHTML.style.left = `${cssLeft}px`;
        this.elementoHTML.style.top = `${cssTop}px`;
        
        // Tamanho
        this.elementoHTML.style.width = `${this.diametro}px`;
        this.elementoHTML.style.height = `${this.diametro}px`;
        
        // Cor baseada no estado de colisão
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

        // Converte de volta para o sistema de coordenadas da cena
        this.x = Math.round(newCssLeft);
        this.y = Math.round(this.scene.clientHeight - newCssTop - this.diametro);

        // Garante que o objeto não saia da cena
        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - this.diametro));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - this.diametro));

        this.coordinatesSpan.textContent = `Coordenadas (X, Y): ${this.x}, ${this.y}`;

        // Salva a nova posição no localStorage
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
        this.elementoHTML.style.zIndex = 1;
        this.coordinatesSpan.textContent = `Coordenadas (X, Y): ...`;
    }
}

