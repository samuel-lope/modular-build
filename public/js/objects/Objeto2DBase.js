// File location: objects/Objeto2DBase.js

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

        // Dependências injetadas para checagem de colisão com obstáculos
        this.allObjects = null;
        this.collisionChecker = null;
    }

    /**
     * Atualiza as propriedades base do objeto a partir de uma nova configuração.
     * As classes filhas devem chamar super.update(config) e depois atualizar suas propriedades específicas.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        Object.assign(this, config);
        this.view = config.view || 0;
        this.isObstacle = config.isObstacle || false; 
        this.groupId = config.groupId || null;
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
        let newCssLeft = clientX - sceneRect.left - this.offsetX;
        let newCssTop = clientY - sceneRect.top - this.offsetY;
        
        const larguraObjeto = this.largura || this.diametro || this.elementoHTML.clientWidth;
        const alturaObjeto = this.altura || this.diametro || this.elementoHTML.clientHeight;

        let newX = Math.round(newCssLeft);
        let newY = Math.round(this.scene.clientHeight - newCssTop - alturaObjeto);

        // Limita o movimento à cena
        newX = Math.max(0, Math.min(newX, this.scene.clientWidth - larguraObjeto));
        newY = Math.max(0, Math.min(newY, this.scene.clientHeight - alturaObjeto));

        const deltaX = newX - this.x;
        const deltaY = newY - this.y;

        // --- LÓGICA DA BARREIRA ---
        if (this.allObjects && this.collisionChecker) {
            const obstacles = this.allObjects.filter(obj => obj.isObstacle && obj.id !== this.id && !this.groupId);
            if (obstacles.length > 0) {
                const ghost = { 
                    ...this, 
                    x: newX, 
                    y: newY, 
                    largura: this.largura || this.diametro, 
                    altura: this.altura || this.diametro 
                };

                let collisionDetected = false;
                for (const obstacle of obstacles) {
                    if (this.collisionChecker(ghost, obstacle)) {
                        collisionDetected = true;
                        break;
                    }
                }
                if (collisionDetected) return; // Impede o movimento
            }
        }

        // --- LÓGICA DE GRUPO ---
        if (this.groupId && this.allObjects) {
            const group = this.allObjects.find(obj => obj.id === this.groupId);
            if (group) {
                group.moveBy(deltaX, deltaY);
            }
        } else {
            // Movimento individual
            this.x = newX;
            this.y = newY;
            this.updateAppearance();
        }
    }

    pararArrasto() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.elementoHTML.style.zIndex = this.view;

        // Se o objeto pertence a um grupo, o grupo lida com o salvamento
        if (this.groupId && this.allObjects) {
            const group = this.allObjects.find(obj => obj.id === this.groupId);
            if (group) {
                const appData = JSON.parse(localStorage.getItem(this.storageKey)) || { theme: {}, objects: [] };
                
                // Atualiza o grupo e seus filhos no localStorage
                appData.objects = appData.objects.map(d => {
                    if (d.id === group.id) {
                        return { ...d, x: group.x, y: group.y };
                    }
                    const childInGroup = group.childObjects.find(c => c.id === d.id);
                    if (childInGroup) {
                        return { ...d, x: childInGroup.x, y: childInGroup.y };
                    }
                    return d;
                });
                localStorage.setItem(this.storageKey, JSON.stringify(appData));
            }
        } else {
            // Salvamento individual
            this.salvarPosicaoNoStorage();
        }
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

