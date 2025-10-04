import Objeto2DBase from './Objeto2DBase.js';

/**
 * Classe que define um objeto RX-Serial.
 * Este objeto estabelece uma conexão via Web Serial API para receber dados
 * e controlar um objeto Slider na cena.
 */
export default class RXSerial extends Objeto2DBase {
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

        // Propriedades da Web Serial
        this.port = null;
        this.reader = null;
        this.isReading = false;
        this.keepReading = true;
        this.readingLoopPromise = null; // Para aguardar a finalização do loop de leitura

        // Propriedades de exibição
        this.status = 'Desconectado';
        this.lastValue = 'N/A';
        this.portInfo = 'Nenhuma';
        
        // Ícone para o botão de conexão
        this.iconConnect = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8V5c0-1.1-.9-2-2-2H4a2 2 0 00-2 2v14c0 1.1.9 2 2 2h12a2 2 0 002-2v-3"/><path d="M10 12H2"/><path d="m7 9-3 3 3 3"/></svg>`;

        // Dimensões fixas
        this.largura = 220;
        this.altura = 100;

        this.criarElemento();
        this.update(config);
    }

    /**
     * Cria os elementos visuais do objeto no DOM.
     */
    criarElemento() {
        super.criarElemento(); 
        this.elementoHTML.classList.add('object-slider', 'p-4', 'flex', 'flex-col', 'justify-between');
        this.elementoHTML.style.border = '1px solid #67e8f9';
        
        this.elementoHTML.innerHTML = `
            <div class="flex justify-between items-start border-b border-gray-600 pb-1">
                <div>
                    <span class="font-bold text-base text-cyan-400">RX-Serial</span>
                    <span id="status-${this.id}" class="px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">Desconectado</span>
                </div>
                <button id="connect-btn-${this.id}" title="Conectar" class="p-1 rounded-md hover:bg-gray-600 transition-colors">
                    ${this.iconConnect}
                </button>
            </div>
            <div class="mt-2 text-sm">
                <p>Porta: <span id="port-${this.id}" class="font-mono text-gray-300">Nenhuma</span></p>
                <p>Valor: <span id="value-${this.id}" class="font-mono text-lg font-bold text-white">N/A</span></p>
            </div>
        `;
        
        this.connectBtn = this.elementoHTML.querySelector(`#connect-btn-${this.id}`);
        this.connectBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o duplo clique para abrir o formulário seja acionado
            this.connect();
        });
    }

    /**
     * Atualiza as propriedades do objeto a partir de uma nova configuração.
     * @param {object} config - O novo objeto de configuração.
     */
    update(config) {
        super.update(config);
        this.targetSliderId = config.targetSliderId || null;
        this.baudRate = config.baudRate || 9600;
        this.updateAppearance();
    }

    /**
     * Atualiza a aparência visual e as informações exibidas no objeto.
     */
    updateAppearance() {
        if (!this.elementoHTML) return;

        const cssLeft = this.x;
        const cssTop = this.scene.clientHeight - this.y - this.altura;
        this.elementoHTML.style.left = `${cssLeft}px`;
        this.elementoHTML.style.top = `${cssTop}px`;
        this.elementoHTML.style.width = `${this.largura}px`;
        this.elementoHTML.style.height = `${this.altura}px`;
        this.elementoHTML.style.zIndex = this.view;

        const statusEl = this.elementoHTML.querySelector(`#status-${this.id}`);
        const portEl = this.elementoHTML.querySelector(`#port-${this.id}`);
        const valueEl = this.elementoHTML.querySelector(`#value-${this.id}`);
        const connectBtn = this.elementoHTML.querySelector(`#connect-btn-${this.id}`);

        statusEl.textContent = this.status;
        portEl.textContent = this.portInfo;
        valueEl.textContent = this.lastValue;
        
        if (this.status === 'Conectado') {
            statusEl.classList.remove('bg-red-600');
            statusEl.classList.add('bg-green-600');
            connectBtn.style.display = 'none'; // Esconde o botão quando conectado
        } else {
            statusEl.classList.remove('bg-green-600');
            statusEl.classList.add('bg-red-600');
            connectBtn.style.display = 'block'; // Mostra o botão quando desconectado
        }
    }
    
    /**
     * Solicita permissão ao utilizador e abre a porta serial.
     */
    async connect() {
        if (!('serial' in navigator)) {
            alert('A Web Serial API não é suportada neste navegador. Tente usar o Chrome ou Edge.');
            return;
        }

        // Se já estiver conectado ou tentando conectar, não faz nada.
        if (this.port) return;

        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: this.baudRate });

            this.status = 'Conectado';
            const portInfo = this.port.getInfo();
            this.portInfo = `VID:${portInfo.usbVendorId} PID:${portInfo.usbProductId}`;
            this.keepReading = true;
            this.readingLoopPromise = this.readLoop();
            
        } catch (error) {
            this.status = 'Erro';
            this.portInfo = 'Falha ao conectar';
            console.error('Erro ao conectar à porta serial:', error);
            this.port = null; // Garante que o estado de "desconectado" seja mantido em caso de falha
        }
        this.updateAppearance();
    }

    /**
     * Fecha a porta serial e interrompe a leitura de forma robusta.
     */
    async disconnect() {
        if (!this.port) return;

        this.keepReading = false;

        if (this.reader) {
            try {
                await this.reader.cancel();
            } catch (error) {
                // Erro esperado, pois cancelar interrompe a leitura
            }
        }
        
        if (this.readingLoopPromise) {
            await this.readingLoopPromise;
        }
        
        if (this.port && this.port.readable) {
            await this.port.close().catch(() => {});
        }
        
        this.port = null;
        this.reader = null;
        this.isReading = false;
        this.readingLoopPromise = null;
        this.status = 'Desconectado';
        this.portInfo = 'Nenhuma';
        this.updateAppearance();
    }

    /**
     * Loop de leitura contínua da porta serial.
     */
    async readLoop() {
        if (!this.port || !this.port.readable) return;
        this.isReading = true;
        
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();

        let buffer = '';
        try {
            while (this.keepReading) {
                const { value, done } = await this.reader.read();
                if (done) {
                    this.keepReading = false;
                    break;
                }
                
                buffer += value;
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);

                    if (line) {
                        const numericValue = parseFloat(line);
                        if (!isNaN(numericValue)) {
                            this.lastValue = numericValue;
                            this.updateAppearance();
                            this.updateTargetSlider(numericValue);
                        }
                    }
                }
            }
        } catch (error) {
            if (this.keepReading) {
                console.error('Erro de leitura Serial:', error);
                this.status = 'Erro';
            }
        } finally {
            if (this.reader) {
                this.reader.releaseLock();
            }
            await readableStreamClosed.catch(() => {});
            this.isReading = false;
        }
    }

    /**
     * Atualiza o valor do Slider alvo com o dado recebido.
     * @param {number} value - O valor numérico recebido da serial.
     */
    updateTargetSlider(value) {
        if (!this.targetSliderId) return;

        const targetSlider = this.allObjectInstances.find(obj => obj.id === this.targetSliderId);
        if (targetSlider && targetSlider.type === 'slider') {
            const clampedValue = Math.max(targetSlider.min, Math.min(targetSlider.max, value));
            
            targetSlider.sliderInput.value = clampedValue;
            targetSlider.handleSliderInput();
        }
    }
    
    /**
     * Sobrescreve destroy para garantir que a conexão seja fechada.
     */
    destroy() {
        this.disconnect();
        super.destroy();
    }
}

