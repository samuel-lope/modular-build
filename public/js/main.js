import Retangulo from './objects/Retangulo.js';
import Circulo from './objects/Circulo.js';
import Slider from './objects/Slider.js';
// A classe base não precisa ser importada aqui, pois as classes filhas já a conhecem.

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
    'slider': {
        class: Slider,
        displayName: 'Slider',
        buttonClass: 'bg-purple-600 hover:bg-purple-700',
        formFieldsId: 'slider-fields',
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
const duplicateBtn = document.getElementById('duplicate-btn');
const objectIdInput = document.getElementById('object-id');
const objectTypeInput = document.getElementById('object-type');

// --- ELEMENTOS DA TABELA ---
const manageObjectsBtn = document.getElementById('manage-objects-btn');
const tableModalContainer = document.getElementById('table-modal-container');
const closeTableBtn = document.getElementById('close-table-btn');
const objectsTable = document.getElementById('objects-table');

// --- ESTADO DA APLICAÇÃO ---
let isCollisionDetectionActive = true;
const allObjects = []; // Array para armazenar as instâncias dos objetos
const STORAGE_KEY = 'interactive_2d_app_data_v1';
const DEFAULT_THEME = { backgroundColor: '#374151' };

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
    if (objA.type === 'slider' || objB.type === 'slider') return false; 
    
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
 * Loop principal da aplicação.
 */
function gameLoop() {
    const collidableObjects = allObjects.filter(obj => ['retangulo', 'circulo'].includes(obj.type));

    if (isCollisionDetectionActive) {
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
    }
    requestAnimationFrame(gameLoop);
}

// --- LÓGICA DO FORMULÁRIO ---

function populateTargetObjectDropdown(currentId) {
    const targetObjectSelect = document.getElementById('target-object');
    targetObjectSelect.innerHTML = '';
    
    const { objects: objectsData } = loadAppDataFromStorage();
    const availableTargets = objectsData.filter(obj => ['retangulo', 'circulo'].includes(obj.type));

    availableTargets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = `${target.nome || 'Sem nome'} (${target.id.substring(0, 8)})`;
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
        duplicateBtn.classList.remove('hidden');
    } else { // Modo Criação
        formTitle.textContent = `Adicionar Novo ${typeInfo.displayName}`;
        objectIdInput.value = `${type}_${Date.now()}`;
        document.getElementById('object-view').value = objectsData.length;
        document.getElementById('x').value = Math.round(Math.random() * 200 + 50);
        document.getElementById('y').value = Math.round(Math.random() * 200 + 50);
        deleteBtn.classList.add('hidden');
        duplicateBtn.classList.add('hidden');
    }
    
    // Lógica específica para preencher valores do formulário
    if (type === 'retangulo' || type === 'circulo') {
        if (config) {
            document.getElementById('cor').value = config.collisionHandlers.onNoCollision.cor;
            document.getElementById('cor-colisao').value = config.collisionHandlers.onCollision.cor;
            document.getElementById('reacts-to-collision').checked = config.reactsToCollision;
        } else {
             document.getElementById('cor').value = 'rgba(59, 130, 246, 1)';
             document.getElementById('cor-colisao').value = 'rgba(239, 68, 68, 1)';
             document.getElementById('reacts-to-collision').checked = true;
        }
    }
    
    if (type === 'retangulo') {
        if (config) {
            document.getElementById('largura').value = config.largura;
            document.getElementById('altura').value = config.altura;
            document.getElementById('rotation').value = (config.rotation || 0) * (180 / Math.PI);
        } else {
             document.getElementById('object-name').value = 'Novo Retângulo';
             document.getElementById('largura').value = 150;
             document.getElementById('altura').value = 80;
             document.getElementById('rotation').value = 0;
        }
    } else if (type === 'circulo') {
        if (config) {
            document.getElementById('diametro').value = config.diametro;
        } else {
            document.getElementById('object-name').value = 'Novo Círculo';
            document.getElementById('diametro').value = 100;
        }
    } else if (type === 'slider') {
        populateTargetObjectDropdown(config ? config.targetId : null);
        if (config) {
            document.getElementById('target-property').value = config.targetProperty;
            document.getElementById('min-value').value = config.min;
            document.getElementById('max-value').value = config.max;
        } else {
            document.getElementById('object-name').value = 'Novo Slider';
        }
    }

    formContainer.classList.remove('hidden');
}


function closeForm() {
    formContainer.classList.add('hidden');
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
        };
    }
}


function handleFormSubmit(event) {
    event.preventDefault();
    const config = getConfigFromForm();
    const id = config.id;
    
    const appData = loadAppDataFromStorage();
    const isEditing = appData.objects.some(obj => obj.id === id);

    if (isEditing) {
        appData.objects = appData.objects.map(data => (data.id === id ? config : data));
        const objectInstance = allObjects.find(obj => obj.id === id);
        if (objectInstance) {
            objectInstance.update(config);
        }
    } else {
        appData.objects.push(config);
        createObjectInstance(config);
    }
    
    saveAppDataToStorage(appData);
    closeForm();
}

function handleDelete() {
    const idToDelete = objectIdInput.value;
    const objectIndex = allObjects.findIndex(obj => obj.id === idToDelete);
    if (objectIndex > -1) {
        allObjects[objectIndex].destroy();
        allObjects.splice(objectIndex, 1);
    }
    
    const appData = loadAppDataFromStorage();
    appData.objects = appData.objects.filter(data => data.id !== idToDelete);
    saveAppDataToStorage(appData);
    closeForm();
}

function handleDuplicate() {
    const config = getConfigFromForm();
    const newConfig = {
        ...config,
        id: `${config.type}_${Date.now()}`,
        nome: `${config.nome} (cópia)`,
        x: config.x + 20,
        y: config.y + 20,
    };
    
    const appData = loadAppDataFromStorage();
    appData.objects.push(newConfig);
    saveAppDataToStorage(appData);
    
    createObjectInstance(newConfig);

    closeForm();
}

// --- LÓGICA DA TABELA DE GERENCIAMENTO ---

const tableHeaders = ['ID', 'Nome', 'Tipo', 'View', 'X', 'Y', 'Largura', 'Altura', 'Diâmetro', 'Rotação (°)', 'Alvo ID', 'Alvo Prop.'];
const editableProperties = ['nome', 'view', 'x', 'y', 'largura', 'altura', 'diametro', 'rotation', 'targetId', 'targetProperty'];

function openObjectsTable() {
    const { objects: objectsData } = loadAppDataFromStorage();
    const thead = objectsTable.querySelector('thead');
    const tbody = objectsTable.querySelector('tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const headerRow = document.createElement('tr');
    tableHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    objectsData.forEach(obj => {
        const row = document.createElement('tr');
        tableHeaders.forEach(header => {
            const td = document.createElement('td');
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
            }

            value = obj[key];
            if (key === 'rotation' && value !== undefined) {
                value = (value * (180 / Math.PI)).toFixed(2); // Converte radianos para graus
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
            } else {
                 td.style.color = '#9ca3af'; // gray-400
            }

            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    tableModalContainer.classList.remove('hidden');
}

function closeObjectsTable() {
    tableModalContainer.classList.add('hidden');
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
        valueToSave = newValue * (Math.PI / 180); // Converte graus para radianos
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


// --- INICIALIZAÇÃO E CRIAÇÃO DE INSTÂNCIAS ---

function createObjectInstance(config) {
    const typeInfo = objectTypeRegistry[config.type];
    if (!typeInfo) return;

    const ObjectClass = typeInfo.class;
    let newObject;
    
    switch (config.type) {
        case 'slider':
            newObject = new ObjectClass(scene, config, allObjects, openForm, STORAGE_KEY);
            break;
        
        case 'retangulo':
        case 'circulo':
            newObject = new ObjectClass(scene, coordinatesSpan, config, openForm, STORAGE_KEY);
            break;
        
        default:
            console.error(`Tipo de objeto desconhecido: ${config.type}`);
            return;
    }

    allObjects.push(newObject);
}


function generateAddButtons() {
    addButtonsContainer.innerHTML = '';
    const manageBtn = document.createElement('button');
    manageBtn.id = 'manage-objects-btn';
    manageBtn.className = 'px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg shadow-md transition-colors font-semibold';
    manageBtn.textContent = 'Gerenciar Objetos';
    manageBtn.addEventListener('click', openObjectsTable);
    addButtonsContainer.appendChild(manageBtn);

    for (const [type, typeInfo] of Object.entries(objectTypeRegistry)) {
        const button = document.createElement('button');
        button.textContent = `Adicionar ${typeInfo.displayName}`;
        button.className = `px-4 py-2 rounded-lg shadow-md transition-colors font-semibold ${typeInfo.buttonClass}`;
        button.addEventListener('click', () => openForm(null, type));
        addButtonsContainer.prepend(button);
    }
}

function init() {
    const appData = loadAppDataFromStorage();
    
    generateAddButtons();
    
    scene.style.backgroundColor = appData.theme.backgroundColor;
    bgColorPicker.value = appData.theme.backgroundColor;

    appData.objects.forEach(data => createObjectInstance(data));
    
    cancelBtn.addEventListener('click', closeForm);
    deleteBtn.addEventListener('click', handleDelete);
    duplicateBtn.addEventListener('click', handleDuplicate);
    objectForm.addEventListener('submit', handleFormSubmit);

    closeTableBtn.addEventListener('click', closeObjectsTable);

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

