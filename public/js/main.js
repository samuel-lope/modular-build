import Retangulo from './objects/Retangulo.js';
import Circulo from './objects/Circulo.js';
import Slider from './objects/Slider.js';
import Grupo from './objects/Grupo.js';
import Condicional from './objects/Condicional.js';
import RXSerial from './objects/RXSerial.js';

// --- REGISTRO DE TIPOS DE OBJETO ---
const objectTypeRegistry = {
    'retangulo': {
        class: Retangulo,
        displayName: 'Retângulo',
        buttonClass: 'bg-blue-600 hover:bg-blue-700',
        formFieldsId: 'rect-fields',
        commonFieldsId: 'shape-common-fields'
    },
    'circulo': {
        class: Circulo,
        displayName: 'Círculo',
        buttonClass: 'bg-green-600 hover:bg-green-700',
        formFieldsId: 'circle-fields',
        commonFieldsId: 'shape-common-fields'
    },
    'condicional': {
        class: Condicional,
        displayName: 'Condicional',
        buttonClass: 'bg-yellow-500 hover:bg-yellow-600',
        formFieldsId: 'conditional-fields',
        commonFieldsId: 'shape-common-fields'
    },
    'rx-serial': {
        class: RXSerial,
        displayName: 'RX-Serial',
        buttonClass: 'bg-cyan-600 hover:bg-cyan-700',
        formFieldsId: 'rx-serial-fields',
        commonFieldsId: null
    },
    'slider': {
        class: Slider,
        displayName: 'Slider',
        buttonClass: 'bg-purple-600 hover:bg-purple-700',
        formFieldsId: 'slider-fields',
        commonFieldsId: null
    },
    'grupo': {
        class: Grupo,
        displayName: 'Grupo',
        buttonClass: 'hidden', // Não pode ser adicionado manualmente
        formFieldsId: null,
        commonFieldsId: null
    }
};

// --- CONFIGURAÇÃO INICIAL ---
const scene = document.getElementById('scene');
const coordinatesSpan = document.getElementById('coords');
const bgColorPicker = document.getElementById('bg-color-picker');
const addButtonsContainer = document.getElementById('add-buttons-container');

// --- ELEMENTOS DO FORMULÁRIO ---
const formContainer = document.getElementById('form-container');
const objectForm = document.getElementById('object-form');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');
const objectIdInput = document.getElementById('object-id');
const objectTypeInput = document.getElementById('object-type');

// --- ELEMENTOS DA UI GERAL ---
const clearSceneBtn = document.getElementById('clear-scene-btn');
const downloadJsonBtn = document.getElementById('download-json-btn');
const importJsonBtn = document.getElementById('import-json-btn');
const importJsonInput = document.getElementById('import-json-input');

// --- ELEMENTOS DA TABELA ---
const manageObjectsBtn = document.getElementById('manage-objects-btn');
const tableModalContainer = document.getElementById('table-modal-container');
const closeTableBtn = document.getElementById('close-table-btn');
const objectsTable = document.getElementById('objects-table');

// --- ESTADO DA APLICAÇÃO ---
const allObjects = []; // Array para armazenar as instâncias dos objetos
const STORAGE_KEY = 'interactive_2d_app_data_v1';
const DEFAULT_THEME = { backgroundColor: '#374151' };

// --- ÍCONES PARA OS BOTÕES ---
const objectIcons = {
    retangulo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>`,
    circulo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle></svg>`,
    condicional: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"></path></svg>`,
    'rx-serial': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8V5c0-1.1-.9-2-2-2H4a2 2 0 00-2 2v14c0 1.1.9 2 2 2h12a2 2 0 002-2v-3"/><path d="M10 12H2"/><path d="m7 9-3 3 3 3"/><path d="M22 12h-6"/><path d="m19 9 3 3-3 3"/></svg>`,
    slider: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><circle cx="8" cy="9" r="2"></circle><circle cx="16" cy="15" r="2"></circle></svg>`,
    manage: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`
};
const uiIcons = {
    download: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    upload: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
    delete: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    group: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
};

/**
 * Lê os dados da aplicação do localStorage.
 * @returns {{theme: object, objects: Array}} - Objeto com tema e array de objetos.
 */
function loadAppDataFromStorage() {
    const dataJSON = localStorage.getItem(STORAGE_KEY);
    if (dataJSON) {
        return JSON.parse(dataJSON);
    }
    return { theme: { ...DEFAULT_THEME }, objects: [] };
}

/**
 * Salva os dados da aplicação no localStorage.
 * @param {{theme: object, objects: Array}} appData - O objeto de dados da aplicação.
 */
function saveAppDataToStorage(appData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

/**
 * Verifica a colisão entre dois objetos (AABB).
 */
function checkAABBCollision(objA, objB) {
    if (objA.type === 'slider' || objB.type === 'slider' || objA.type === 'rx-serial' || objB.type === 'rx-serial') return false; 
    
    const larguraA = objA.largura || objA.diametro;
    const alturaA = objA.altura || objA.diametro;
    const larguraB = objB.largura || objB.diametro;
    const alturaB = objB.altura || objB.diametro;
    
    return (
        objA.x < objB.x + larguraB &&
        objA.x + larguraA > objB.x &&
        objA.y < objB.y + alturaB &&
        objA.y + alturaA > objB.y
    );
}

/**
 * Mapeia um valor de uma escala para outra.
 * @param {number} value - O valor a ser mapeado.
 * @param {number} fromMin - O mínimo da escala de origem.
 * @param {number} fromMax - O máximo da escala de origem.
 * @param {number} toMin - O mínimo da escala de destino.
 * @param {number} toMax - O máximo da escala de destino.
 * @returns {number} - O valor mapeado e arredondado.
 */
function mapValue(value, fromMin, fromMax, toMin, toMax) {
    const fromRange = fromMax - fromMin;
    if (fromRange === 0) return toMin; // Evita divisão por zero
    const toRange = toMax - toMin;
    const scaledValue = (value - fromMin) / fromRange;
    return Math.round((scaledValue * toRange) + toMin);
}

/**
 * Loop principal da aplicação.
 */
function gameLoop() {
    const collidableObjects = allObjects.filter(obj => ['retangulo', 'circulo', 'condicional'].includes(obj.type));
    const conditionalObjects = allObjects.filter(obj => obj.type === 'condicional');
    const childSliders = allObjects.filter(obj => obj.type === 'slider' && obj.inheritedSliderId);

    // --- LÓGICA DE COLISÃO ---
    collidableObjects.forEach(obj => { obj.isColliding = false; });

    for (let i = 0; i < collidableObjects.length; i++) {
        for (let j = i + 1; j < collidableObjects.length; j++) {
            const objA = collidableObjects[i];
            const objB = collidableObjects[j];

            if (checkAABBCollision(objA, objB)) {
                if (objA.reactsToCollision) objA.isColliding = true;
                if (objB.reactsToCollision) objB.isColliding = true;
            }
        }
    }
    collidableObjects.forEach(obj => { obj.updateAppearance(); });
    
    // --- LÓGICA CONDICIONAL ---
    conditionalObjects.forEach(condObj => {
        const targetObject = allObjects.find(obj => obj.id === condObj.conditionTargetId);
        if (targetObject) {
            if (condObj.checkCondition(targetObject)) {
                condObj.applyTransformation();
            } else {
                condObj.resetTransformation();
            }
        }
    });
    
    // LÓGICA DE HERANÇA DE SLIDERS
    childSliders.forEach(child => {
        const parent = allObjects.find(obj => obj.id === child.inheritedSliderId);
        if (parent && parent.type === 'slider') {
            const parentValue = parseFloat(parent.sliderInput.value);
            const mappedValue = mapValue(parentValue, parent.min, parent.max, child.min, child.max);

            if (parseFloat(child.sliderInput.value) !== mappedValue) {
                child.sliderInput.value = mappedValue;
                child.handleSliderInput();
            }
        }
    });

    requestAnimationFrame(gameLoop);
}


// --- LÓGICA DO FORMULÁRIO ---

function populateTargetObjectDropdown(currentId) {
    const targetObjectSelect = document.getElementById('target-object');
    targetObjectSelect.innerHTML = '<option value="">Nenhum</option>';
    
    const { objects: objectsData } = loadAppDataFromStorage();
    const availableTargets = objectsData.filter(obj => ['retangulo', 'circulo', 'grupo', 'condicional'].includes(obj.type));

    availableTargets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = `${target.nome || 'Sem nome'} (${target.id.substring(0, 3)})`;
        if (target.id === currentId) {
            option.selected = true;
        }
        targetObjectSelect.appendChild(option);
    });
}


function openForm(config = null, type) {
    objectForm.reset();
    objectTypeInput.value = type;

    // Esconde todos os grupos de campos específicos
    Object.values(objectTypeRegistry).forEach(typeInfo => {
        const fieldsElement = typeInfo.formFieldsId ? document.getElementById(typeInfo.formFieldsId) : null;
        if (fieldsElement) fieldsElement.classList.add('hidden');

        const commonFieldsElement = typeInfo.commonFieldsId ? document.getElementById(typeInfo.commonFieldsId) : null;
        if (commonFieldsElement) commonFieldsElement.classList.add('hidden');
    });

    const { objects: objectsData } = loadAppDataFromStorage();
    const typeInfo = objectTypeRegistry[type];
    if (!typeInfo) return;

    // Mostra os campos relevantes para o tipo de objeto
    const fieldsElement = typeInfo.formFieldsId ? document.getElementById(typeInfo.formFieldsId) : null;
    if (fieldsElement) fieldsElement.classList.remove('hidden');

    const commonFieldsElement = typeInfo.commonFieldsId ? document.getElementById(typeInfo.commonFieldsId) : null;
    if (commonFieldsElement) commonFieldsElement.classList.remove('hidden');
    
    if (config) { // Modo Edição
        formTitle.textContent = `Editar ${typeInfo.displayName}`;
        objectIdInput.value = config.id;
        document.getElementById('object-name').value = config.nome;
        document.getElementById('object-view').value = config.view || 0;
        document.getElementById('x').value = Math.round(config.x);
        document.getElementById('y').value = Math.round(config.y);
        deleteBtn.classList.remove('hidden');
    } else { // Modo Criação
        formTitle.textContent = `Adicionar Novo ${typeInfo.displayName}`;
        objectIdInput.value = `${type}_${Date.now()}`;
        document.getElementById('object-view').value = objectsData.length;
        document.getElementById('x').value = Math.round(Math.random() * 200 + 50);
        document.getElementById('y').value = Math.round(Math.random() * 200 + 50);
        deleteBtn.classList.add('hidden');
    }
    
    // Lógica específica para preencher valores do formulário
    if (type === 'retangulo' || type === 'circulo' || type === 'condicional') {
        if (config) {
            document.getElementById('cor').value = config.collisionHandlers.onNoCollision.cor;
            document.getElementById('cor-colisao').value = config.collisionHandlers.onCollision.cor;
            document.getElementById('reacts-to-collision').checked = config.reactsToCollision;
            document.getElementById('is-obstacle').checked = config.isObstacle || false;
        } else {
             document.getElementById('cor').value = 'rgba(59, 130, 246, 1)';
             document.getElementById('cor-colisao').value = 'rgba(239, 68, 68, 1)';
             document.getElementById('reacts-to-collision').checked = true;
             document.getElementById('is-obstacle').checked = false;
        }
    }
    
    if (type === 'retangulo' || type === 'condicional') {
        if (type === 'condicional') {
             document.getElementById('rect-fields').classList.remove('hidden');
        }
        if (config) {
            document.getElementById('largura').value = config.largura;
            document.getElementById('altura').value = config.altura;
            document.getElementById('rotation').value = (config.rotation || 0) * (180 / Math.PI);
        } else {
             document.getElementById('object-name').value = type === 'condicional' ? 'Novo Condicional' : 'Novo Retângulo';
             document.getElementById('largura').value = 150;
             document.getElementById('altura').value = 80;
             document.getElementById('rotation').value = 0;
        }
    } 
    
    if (type === 'circulo') {
        if (config) {
            document.getElementById('diametro').value = config.diametro;
        } else {
            document.getElementById('object-name').value = 'Novo Círculo';
            document.getElementById('diametro').value = 100;
        }
    } 
    
    if (type === 'slider') {
        populateInheritSliderDropdown(config ? config.id : objectIdInput.value, config ? config.inheritedSliderId : null);
        
        populateTargetObjectDropdown(config ? config.targetId : null);
        if (config) {
            document.getElementById('target-property').value = config.targetProperty;
            document.getElementById('min-value').value = config.min;
            document.getElementById('max-value').value = config.max;
        } else {
            document.getElementById('object-name').value = 'Novo Slider';
        }
    }

    if (type === 'condicional') {
        populateConditionalTargetDropdown(config ? config.conditionTargetId : null);
        if (config) {
            document.getElementById('condition-property').value = config.conditionProperty || 'x';
            document.getElementById('condition-operator').value = config.conditionOperator || '==';
            document.getElementById('condition-value').value = config.conditionValue !== undefined ? config.conditionValue : 0;
            document.getElementById('transformation-type').value = config.transformationType || 'changeColor';
        } else {
            document.getElementById('object-name').value = 'Novo Condicional';
        }
        updateTransformationValueFields(config ? config.transformationType : 'changeColor', config ? config.transformationValue : null);
        document.getElementById('transformation-type').onchange = (e) => updateTransformationValueFields(e.target.value, null);
    }

    if (type === 'rx-serial') {
        populateSliderDropdown(config ? config.targetSliderId : null);
        if (config) {
            document.getElementById('baud-rate').value = config.baudRate || 9600;
        } else {
            document.getElementById('object-name').value = 'RX Serial';
        }
    }

    // CORREÇÃO: Usa a classe 'is-open' para exibir e animar
    formContainer.classList.add('is-open');
}


function closeForm() {
    // CORREÇÃO: Remove a classe 'is-open' para esconder
    formContainer.classList.remove('is-open');
}

function getConfigFromForm() {
    const type = objectTypeInput.value;
    const commonConfig = {
        id: objectIdInput.value,
        type: type,
        nome: document.getElementById('object-name').value.trim() || 'Sem nome',
        view: parseInt(document.getElementById('object-view').value, 10) || 0,
        x: parseInt(document.getElementById('x').value, 10) || 0,
        y: parseInt(document.getElementById('y').value, 10) || 0,
    };
    
    const shapeCommonConfig = {
        reactsToCollision: document.getElementById('reacts-to-collision').checked,
        isObstacle: document.getElementById('is-obstacle').checked,
        collisionHandlers: {
            onCollision: { cor: document.getElementById('cor-colisao').value },
            onNoCollision: { cor: document.getElementById('cor').value }
        }
    };

    if (type === 'retangulo') {
        return {
            ...commonConfig,
            ...shapeCommonConfig,
            largura: parseInt(document.getElementById('largura').value, 10) || 100,
            altura: parseInt(document.getElementById('altura').value, 10) || 50,
            rotation: (parseFloat(document.getElementById('rotation').value) || 0) * (Math.PI / 180),
        };
    } else if (type === 'circulo') {
        return {
            ...commonConfig,
            ...shapeCommonConfig,
            diametro: parseInt(document.getElementById('diametro').value, 10) || 100,
        };
    } else if (type === 'slider') {
         return {
            ...commonConfig,
            targetId: document.getElementById('target-object').value,
            targetProperty: document.getElementById('target-property').value,
            min: parseFloat(document.getElementById('min-value').value) || 0,
            max: parseFloat(document.getElementById('max-value').value) || 100,
            inheritedSliderId: document.getElementById('inherit-slider').value || null
        };
    } else if (type === 'grupo') {
        return commonConfig;
    } else if (type === 'condicional') {
        let transformationValue;
        const transformationType = document.getElementById('transformation-type').value;
        if (transformationType === 'changeColor') {
            transformationValue = { color: document.getElementById('transformation-value-color').value };
        } else if (transformationType === 'changePosition') {
            transformationValue = {
                x: parseInt(document.getElementById('transformation-value-x').value, 10),
                y: parseInt(document.getElementById('transformation-value-y').value, 10)
            };
        }

        return {
            ...commonConfig,
            ...shapeCommonConfig,
            largura: parseInt(document.getElementById('largura').value, 10) || 100,
            altura: parseInt(document.getElementById('altura').value, 10) || 50,
            rotation: (parseFloat(document.getElementById('rotation').value) || 0) * (Math.PI / 180),
            conditionTargetId: document.getElementById('condition-target').value,
            conditionProperty: document.getElementById('condition-property').value,
            conditionOperator: document.getElementById('condition-operator').value,
            conditionValue: parseFloat(document.getElementById('condition-value').value) || 0,
            transformationType: transformationType,
            transformationValue: transformationValue
        };
    } else if (type === 'rx-serial') {
        return {
            ...commonConfig,
            targetSliderId: document.getElementById('target-slider').value,
            baudRate: parseInt(document.getElementById('baud-rate').value, 10) || 9600
        };
    }
}


function handleFormSubmit(event) {
    event.preventDefault();
    const config = getConfigFromForm();
    if (!config) return; 
    const id = config.id;
    
    const appData = loadAppDataFromStorage();
    const isEditing = appData.objects.some(obj => obj.id === id);

    if (isEditing) {
        const objectInstance = allObjects.find(obj => obj.id === id);
        if (objectInstance) {
            objectInstance.update(config);

            if (objectInstance.type === 'grupo') {
                objectInstance.childObjects.forEach(childInstance => {
                    const childDataIndex = appData.objects.findIndex(d => d.id === childInstance.id);
                    if (childDataIndex > -1) {
                        appData.objects[childDataIndex].x = childInstance.x;
                        appData.objects[childDataIndex].y = childInstance.y;
                    }
                });
            }
        }
        appData.objects = appData.objects.map(data => (data.id === id ? config : data));

    } else {
        appData.objects.push(config);
        createObjectInstance(config);
    }    
    saveAppDataToStorage(appData);
    closeForm();
}

function deleteObjectById(idToDelete, typeToDelete) {
    const instance = allObjects.find(obj => obj.id === idToDelete);
    if (instance && instance.destroy) {
        instance.destroy();
    }
    
    const appData = loadAppDataFromStorage();

    if (typeToDelete === 'grupo') {
        appData.objects = appData.objects.map(obj => {
            if (obj.groupId === idToDelete) {
                const { groupId, ...rest } = obj;
                return rest;
            }
            return obj;
        });
    }

    appData.objects = appData.objects.filter(data => data.id !== idToDelete);
    
    saveAppDataToStorage(appData);
    location.reload(); 
}

function handleDelete() {
    const idToDelete = objectIdInput.value;
    const typeToDelete = objectTypeInput.value;
    deleteObjectById(idToDelete, typeToDelete);
}

// --- LÓGICA DA TABELA DE GERENCIAMENTO ---

const tableHeaders = ['ID', 'Nome', 'Tipo', 'View', 'X', 'Y', 'Largura', 'Altura', 'Diâmetro', 'Rotação (°)', 'Alvo ID', 'Alvo Prop.', 'Ações'];
const editableProperties = ['nome', 'view', 'x', 'y', 'largura', 'altura', 'diametro', 'rotation', 'targetId', 'targetProperty'];

function openObjectsTable() {
    const { objects: objectsData } = loadAppDataFromStorage();
    const thead = objectsTable.querySelector('thead tr');
    const tbody = objectsTable.querySelector('tbody');
    const groupBtn = document.getElementById('group-selected-btn');

    thead.innerHTML = '<th class="px-4 py-3 w-12"></th>';
    tbody.innerHTML = '';

    groupBtn.innerHTML = uiIcons.group;
    groupBtn.title = 'Agrupar Selecionados';
    groupBtn.className = 'p-2 rounded-lg shadow-md transition-colors font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed';

    tableHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'px-4 py-3';
        th.textContent = headerText;
        thead.appendChild(th);
    });

    objectsData.forEach(obj => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-gray-700';

        const checkboxCell = document.createElement('td');
        checkboxCell.className = 'px-4 py-2';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = obj.id;
        checkbox.className = 'object-select-checkbox w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500';
        if (obj.type === 'grupo' || obj.groupId) {
            checkbox.disabled = true;
        }
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        tableHeaders.forEach(header => {
            const td = document.createElement('td');
            td.className = 'px-4 py-2';
            let key, value;
            
            switch(header) {
                case 'ID': key = 'id'; break;
                case 'Nome': key = 'nome'; break;
                case 'Tipo': key = 'type'; break;
                case 'View': key = 'view'; break;
                case 'X': key = 'x'; break;
                case 'Y': key = 'y'; break;
                case 'Largura': key = 'largura'; break;
                case 'Altura': key = 'altura'; break;
                case 'Diâmetro': key = 'diametro'; break;
                case 'Rotação (°)': key = 'rotation'; break;
                case 'Alvo ID': key = 'targetId'; break;
                case 'Alvo Prop.': key = 'targetProperty'; break;
                case 'Ações': key = 'actions'; break;
            }

            if (key === 'actions') {
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = uiIcons.delete;
                deleteButton.title = 'Excluir Objeto';
                deleteButton.className = 'p-1 text-red-500 hover:text-red-400';
                deleteButton.addEventListener('click', () => {
                    if (confirm(`Tem certeza que deseja excluir o objeto "${obj.nome || obj.id}"?`)) {
                        deleteObjectById(obj.id, obj.type);
                    }
                });
                td.appendChild(deleteButton);
            } else {
                value = obj[key];
                if (key === 'id' && obj.groupId) {
                    value = `${value} (G: ${obj.groupId.substring(0,4)})`;
                }
                if (key === 'rotation' && value !== undefined) {
                    value = (value * (180 / Math.PI)).toFixed(2);
                }
                
                td.textContent = value !== undefined ? value : 'N/A';
                td.dataset.objectId = obj.id;
                td.dataset.property = key;

                if (editableProperties.includes(key) && obj[key] !== undefined) {
                    td.contentEditable = true;
                    td.addEventListener('blur', handleTableCellEdit);
                    td.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.target.blur();
                        }
                    });
                } else if (key !== 'actions') {
                     td.style.color = '#9ca3af';
                }
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    const checkboxes = tbody.querySelectorAll('.object-select-checkbox:not(:disabled)');
    const toggleGroupButton = () => {
        const selectedCount = tbody.querySelectorAll('.object-select-checkbox:checked').length;
        groupBtn.disabled = selectedCount < 2;
    };
    checkboxes.forEach(cb => cb.addEventListener('change', toggleGroupButton));
    toggleGroupButton();

    groupBtn.addEventListener('click', handleGroupObjects);

    // CORREÇÃO: Usa a classe 'is-open' para exibir e animar
    tableModalContainer.classList.add('is-open');
}

function closeObjectsTable() {
    // CORREÇÃO: Remove a classe 'is-open' para esconder
    tableModalContainer.classList.remove('is-open');
}

function handleTableCellEdit(event) {
    const cell = event.target;
    const { objectId, property } = cell.dataset;
    let newValue = cell.textContent.trim();

    const numericProps = ['view', 'x', 'y', 'largura', 'altura', 'diametro', 'rotation'];
    if (numericProps.includes(property)) {
        newValue = parseFloat(newValue) || 0;
    }
    
    let valueToSave = newValue;
    if (property === 'rotation') {
        valueToSave = newValue * (Math.PI / 180);
    }

    const appData = loadAppDataFromStorage();
    let updatedConfig = null;
    
    appData.objects = appData.objects.map(data => {
        if (data.id === objectId) {
            const newData = { ...data, [property]: valueToSave };
            updatedConfig = newData;
            return newData;
        }
        return data;
    });

    saveAppDataToStorage(appData);

    if (updatedConfig) {
        const instance = allObjects.find(obj => obj.id === objectId);
        if (instance) {
            instance.update(updatedConfig);
        }
    }
}

function handleGroupObjects() {
    const selectedIds = Array.from(document.querySelectorAll('#objects-table .object-select-checkbox:checked')).map(cb => cb.value);

    if (selectedIds.length < 2) {
        alert('Selecione pelo menos dois objetos para agrupar.');
        return;
    }

    const appData = loadAppDataFromStorage();
    const selectedObjects = appData.objects.filter(obj => selectedIds.includes(obj.id));

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedObjects.forEach(obj => {
        const objMaxX = obj.x + (obj.largura || obj.diametro);
        const objMaxY = obj.y + (obj.altura || obj.diametro);
        if (obj.x < minX) minX = obj.x;
        if (obj.y < minY) minY = obj.y;
        if (objMaxX > maxX) maxX = objMaxX;
        if (objMaxY > maxY) maxY = objMaxY;
    });

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;
    const groupX = minX;
    const groupY = minY;

    const groupId = `grupo_${Date.now()}`;
    const newGroup = {
        id: groupId,
        type: 'grupo',
        nome: `Grupo ${allObjects.filter(o => o.type === 'grupo').length + 1}`,
        x: groupX,
        y: groupY,
        largura: groupWidth,
        altura: groupHeight,
        childIds: selectedIds,
        view: Math.max(...selectedObjects.map(o => o.view)) + 1,
    };

    appData.objects = appData.objects.map(obj => {
        if (selectedIds.includes(obj.id)) {
            return { ...obj, groupId: groupId };
        }
        return obj;
    });

    appData.objects.push(newGroup);

    saveAppDataToStorage(appData);
    location.reload();
}

function populateConditionalTargetDropdown(currentId) {
    const targetSelect = document.getElementById('condition-target');
    targetSelect.innerHTML = '';
    const { objects: objectsData } = loadAppDataFromStorage();
    const availableTargets = objectsData.filter(obj => obj.type !== 'slider' && obj.type !== 'condicional' && obj.type !== 'rx-serial');

    availableTargets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = `${target.nome || 'Sem nome'} (${target.type})`;
        if (target.id === currentId) {
            option.selected = true;
        }
        targetSelect.appendChild(option);
    });
}

function updateTransformationValueFields(type, value) {
    const container = document.getElementById('transformation-value-container');
    container.innerHTML = '';

    if (type === 'changeColor') {
        container.innerHTML = `
            <div>
                <label for="transformation-value-color" class="block text-sm font-medium text-gray-400">...para a cor</label>
                <input type="text" id="transformation-value-color" value="${value ? value.color : 'rgba(0, 255, 0, 1)'}" class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3">
            </div>
        `;
    } else if (type === 'changePosition') {
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="transformation-value-x" class="block text-sm font-medium text-gray-400">...para a Posição X</label>
                    <input type="number" id="transformation-value-x" value="${value ? value.x : 100}" class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3">
                </div>
                <div>
                    <label for="transformation-value-y" class="block text-sm font-medium text-gray-400">...para a Posição Y</label>
                    <input type="number" id="transformation-value-y" value="${value ? value.y : 100}" class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3">
                </div>
            </div>
        `;
    }
}

function populateSliderDropdown(currentId) {
    const targetSelect = document.getElementById('target-slider');
    targetSelect.innerHTML = '';
    const { objects: objectsData } = loadAppDataFromStorage();
    const availableSliders = objectsData.filter(obj => obj.type === 'slider');

    if (availableSliders.length === 0) {
        targetSelect.innerHTML = '<option value="">Nenhum slider na cena</option>';
        return;
    }

    availableSliders.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = `${target.nome || 'Slider sem nome'} (${target.id.substring(0, 3)})`;
        if (target.id === currentId) {
            option.selected = true;
        }
        targetSelect.appendChild(option);
    });
}

function populateInheritSliderDropdown(currentSliderId, inheritedId) {
    const inheritSelect = document.getElementById('inherit-slider');
    inheritSelect.innerHTML = '<option value="">Nenhum (Controle Manual)</option>';
    const { objects: objectsData } = loadAppDataFromStorage();
    const availableParents = objectsData.filter(obj => obj.type === 'slider' && obj.id !== currentSliderId);

    availableParents.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = `${target.nome || 'Slider sem nome'} (${target.id.substring(0, 3)})`;
        if (target.id === inheritedId) {
            option.selected = true;
        }
        inheritSelect.appendChild(option);
    });
}


// --- INICIALIZAÇÃO E CRIAÇÃO DE INSTÂNCIAS ---

function createObjectInstance(config) {
    const typeInfo = objectTypeRegistry[config.type];
    if (!typeInfo) return;

    const ObjectClass = typeInfo.class;
    let newObject;
    
    switch (config.type) {
        case 'slider':
        case 'rx-serial':
            newObject = new ObjectClass(scene, config, allObjects, openForm, STORAGE_KEY);
            break;
        
        case 'retangulo':
        case 'circulo':
        case 'condicional':
            newObject = new ObjectClass(scene, coordinatesSpan, config, openForm, STORAGE_KEY);
            newObject.allObjects = allObjects;
            newObject.collisionChecker = checkAABBCollision;
            break;

        case 'grupo':
            newObject = new ObjectClass(config, allObjects);
            break;
        
        default:
            console.error(`Tipo de objeto desconhecido: ${config.type}`);
            return;
    }

    allObjects.push(newObject);
}


function generateAddButtons() {
    addButtonsContainer.innerHTML = '';

    for (const [type, typeInfo] of Object.entries(objectTypeRegistry)) {
        if (type === 'grupo') continue;
        const button = document.createElement('button');
        const displayName = `Adicionar ${typeInfo.displayName}`;
        button.title = displayName;
        button.innerHTML = objectIcons[type];
        button.className = `p-3 rounded-lg shadow-md transition-colors font-semibold ${typeInfo.buttonClass}`;
        button.addEventListener('click', () => openForm(null, type));
        addButtonsContainer.prepend(button);
    }
}

function init() {
    const appData = loadAppDataFromStorage();
    
    generateAddButtons();

    if (manageObjectsBtn) {
        manageObjectsBtn.innerHTML = objectIcons.manage;
        manageObjectsBtn.title = 'Gerenciar Objetos';
        manageObjectsBtn.addEventListener('click', openObjectsTable);
    }

    if (downloadJsonBtn) {
        downloadJsonBtn.innerHTML = uiIcons.download;
        downloadJsonBtn.title = 'Baixar JSON';
        downloadJsonBtn.addEventListener('click', () => {
            const appData = loadAppDataFromStorage();
            const jsonString = JSON.stringify(appData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cena-2d-export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    if (importJsonBtn && importJsonInput) {
        importJsonBtn.innerHTML = uiIcons.upload;
        importJsonBtn.title = 'Importar JSON';

        importJsonInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (importedData && typeof importedData.theme === 'object' && Array.isArray(importedData.objects)) {
                        saveAppDataToStorage(importedData);
                        location.reload();
                    } else {
                        alert('Erro: O arquivo JSON parece ser inválido ou não tem a estrutura esperada (theme, objects).');
                    }
                } catch (error) {
                    alert(`Erro ao processar o arquivo JSON: ${error.message}`);
                }
            };
            reader.readAsText(file);
            event.target.value = null;
        });
    }
    
    scene.style.backgroundColor = appData.theme.backgroundColor;
    bgColorPicker.value = appData.theme.backgroundColor;

    appData.objects.forEach(data => createObjectInstance(data));
    
    cancelBtn.addEventListener('click', closeForm);
    deleteBtn.addEventListener('click', handleDelete);
    objectForm.addEventListener('submit', handleFormSubmit);

    closeTableBtn.addEventListener('click', closeObjectsTable);

    clearSceneBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todos os objetos da cena? Esta ação não pode ser desfeita.')) {
            allObjects.forEach(obj => {
                if(obj.destroy) obj.destroy();
            });
            const appData = loadAppDataFromStorage();
            appData.objects = [];
            saveAppDataToStorage(appData);
            location.reload();
        }
    });

    bgColorPicker.addEventListener('input', (event) => {
        const newColor = event.target.value;
        scene.style.backgroundColor = newColor;
        const currentData = loadAppDataFromStorage();
        currentData.theme.backgroundColor = newColor;
        saveAppDataToStorage(currentData);
    });

    gameLoop();
}

// --- PONTO DE ENTRADA ---
init();

