/**
 * Classe base para todos os objetos 2D arrastáveis na cena.
 * Contém toda a lógica comum de criação, atualização, destruição e arrastar/soltar.
 */
export default class Objeto2DBase {
    /**
     * @param {HTMLElement} scene - O elemento do palco.
     * @param {object} config - O objeto de configuração inicial.
     * @param {Function} openFormCallback - Callback para abrir o formulário de edição.
     * @param {string} storageKey - A chave usada para o localStorage.
     */
    constructor(scene, config, openFormCallback, storageKey) {
        if (this.constructor === Objeto2DBase) {
            throw new Error("A classe base Objeto2DBase não pode ser instanciada diretamente.");
        }
        this.scene = scene;
        this.openFormCallback = openFormCallback;
        this.storageKey = storageKey;

        // Propriedades comuns a todos os objetos
        this.id = config.id;
        this.type = config.type;
        this.nome = config.nome;
        this.x = config.x;
        this.y = config.y;
        this.view = config.view || 0;

        // Estado de interação
        this.elementoHTML = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    /**
     * Atualiza as propriedades base do objeto a partir de uma nova configuração.
     * As classes filhas devem chamar super.update(config) e depois atualizar suas propriedades específicas.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        Object.assign(this, config);
        this.view = config.view || 0;
    }

    /**
     * Cria o elemento DIV base no DOM, adiciona classes e anexa listeners de eventos comuns.
     * As classes filhas devem chamar super.criarElemento() e depois adicionar seus elementos/estilos específicos.
     */
    criarElemento() {
        this.elementoHTML = document.createElement('div');
        this.elementoHTML.id = this.id;
        this.elementoHTML.classList.add('draggable');

        // Listeners para arrastar e soltar (mouse e toque)
        this.elementoHTML.addEventListener('mousedown', this.iniciarArrasto.bind(this));
        this.elementoHTML.addEventListener('touchstart', this.iniciarArrasto.bind(this), { passive: false });
        
        document.addEventListener('mousemove', this.arrastar.bind(this));
        document.addEventListener('touchmove', this.arrastar.bind(this), { passive: false });

        document.addEventListener('mouseup', this.pararArrasto.bind(this));
        document.addEventListener('touchend', this.pararArrasto.bind(this));

        // Listener para abrir o formulário de edição
        this.elementoHTML.addEventListener('dblclick', this.abrirFormulario.bind(this));
        this.setupDoubleTap();

        this.scene.appendChild(this.elementoHTML);
    }

    /**
     * Remove o elemento do DOM.
     */
    destroy() {
        if (this.elementoHTML) this.elementoHTML.remove();
    }
    
    /**
     * Ação de abrir o formulário de edição.
     */
    abrirFormulario(e) {
        if (e) e.stopPropagation();
        const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { objects: [] };
        const currentData = appData.objects.find(d => d.id === this.id);
        if (currentData) {
            this.openFormCallback(currentData, this.type);
        }
    }

    // --- LÓGICA DE DRAG AND DROP (MOUSE E TOQUE) ---
    iniciarArrasto(event) {
        if (event.target.type === 'range') return; // Ignora se for o controle do slider
        event.preventDefault();
        
        this.isDragging = true;
        this.elementoHTML.style.zIndex = 1000;
        
        const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
        const clientY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY;

        const rect = this.elementoHTML.getBoundingClientRect();
        this.offsetX = clientX - rect.left;
        this.offsetY = clientY - rect.top;
    }

    arrastar(event) {
        if (!this.isDragging) return;
        event.preventDefault();

        const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
        const clientY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY;

        const sceneRect = this.scene.getBoundingClientRect();
        const newCssLeft = clientX - sceneRect.left - this.offsetX;
        const newCssTop = clientY - sceneRect.top - this.offsetY;
        
        const larguraObjeto = this.largura || this.diametro || this.elementoHTML.clientWidth;
        const alturaObjeto = this.altura || this.diametro || this.elementoHTML.clientHeight;

        this.x = Math.round(newCssLeft);
        this.y = Math.round(this.scene.clientHeight - newCssTop - alturaObjeto);

        // Limita o movimento à cena
        this.x = Math.max(0, Math.min(this.x, this.scene.clientWidth - larguraObjeto));
        this.y = Math.max(0, Math.min(this.y, this.scene.clientHeight - alturaObjeto));

        this.salvarPosicaoNoStorage();
        this.updateAppearance();
    }

    pararArrasto() {
        this.isDragging = false;
        this.elementoHTML.style.zIndex = this.view;
    }
    
    /**
     * Salva apenas a posição (x,y) do objeto no localStorage para performance.
     */
    salvarPosicaoNoStorage() {
        const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { theme: {}, objects: [] };
        appData.objects = appData.objects.map(d => {
            if (d.id === this.id) {
                return { ...d, x: this.x, y: this.y };
            }
            return d;
        });
        localStorage.setItem(this.storageKey, JSON.stringify(appData));
    }
    
     /**
     * Configura a detecção de toque duplo.
     */
    setupDoubleTap() {
        let lastTap = 0;
        this.elementoHTML.addEventListener('touchend', (event) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                event.preventDefault();
                this.abrirFormulario();
            }
            lastTap = currentTime;
        });
    }

    /**
     * Método placeholder que deve ser implementado pelas classes filhas.
     */
    updateAppearance() {
        throw new Error("O método 'updateAppearance' deve ser implementado pela classe filha.");
    }
}

