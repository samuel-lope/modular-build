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
        this.keepReading = true; // Flag para controlar o loop de leitura

        // Propriedades de exibição
        this.status = 'Desconectado';
        this.lastValue = 'N/A';
        this.portInfo = 'Nenhuma';

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
        super.criarElemento(); // Cria o container draggable base
        this.elementoHTML.classList.add('object-slider', 'p-4', 'flex', 'flex-col', 'justify-between');
        this.elementoHTML.style.border = '1px solid #67e8f9'; // Borda ciano
        
        this.elementoHTML.innerHTML = `
            <div class="flex justify-between items-center border-b border-gray-600 pb-1">
                <span class="font-bold text-base text-cyan-400">RX-Serial</span>
                <span id="status-${this.id}" class="px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">Desconectado</span>
            </div>
            <div class="mt-2 text-sm">
                <p>Porta: <span id="port-${this.id}" class="font-mono text-gray-300">Nenhuma</span></p>
                <p>Valor: <span id="value-${this.id}" class="font-mono text-lg font-bold text-white">N/A</span></p>
            </div>
        `;
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

        statusEl.textContent = this.status;
        portEl.textContent = this.portInfo;
        valueEl.textContent = this.lastValue;
        
        if (this.status === 'Conectado') {
            statusEl.classList.remove('bg-red-600');
            statusEl.classList.add('bg-green-600');
        } else {
            statusEl.classList.remove('bg-green-600');
            statusEl.classList.add('bg-red-600');
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
        
        if (this.port) {
             await this.disconnect();
        }

        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: this.baudRate });

            this.status = 'Conectado';
            const portInfo = this.port.getInfo();
            this.portInfo = `VID:${portInfo.usbVendorId} PID:${portInfo.usbProductId}`;
            this.keepReading = true; // Reseta a flag
            this.readLoop(); // Inicia o loop de leitura
            
        } catch (error) {
            this.status = 'Erro';
            this.portInfo = 'Falha ao conectar';
            console.error('Erro ao conectar à porta serial:', error);
        }
        this.updateAppearance();
    }

    /**
     * Fecha a porta serial e interrompe a leitura.
     */
    async disconnect() {
        this.keepReading = false; // Sinaliza para o loop parar
        
        if (this.reader) {
            try {
                await this.reader.cancel();
            } catch (error) {
                // Ignorar erro se o cancelamento falhar
            }
        }

        if (this.port && this.port.readable) {
            await this.port.close().catch(() => {});
        }
        
        this.port = null;
        this.reader = null;
        this.isReading = false;
        this.status = 'Desconectado';
        this.portInfo = 'Nenhuma';
        this.updateAppearance();
    }

    /**
     * Loop de leitura contínua da porta serial.
     */
    async readLoop() {
        if (!this.port || !this.port.readable || this.isReading) return;
        this.isReading = true;
        
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();

        let buffer = '';
        try {
            while (this.keepReading) {
                const { value, done } = await this.reader.read();
                if (done) {
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
            console.error('Erro durante a leitura da serial:', error);
            this.status = 'Erro de Leitura';
        } finally {
            this.reader.releaseLock();
            await readableStreamClosed.catch(() => {});
            this.isReading = false;
            if (this.keepReading) {
                 this.disconnect();
            }
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

