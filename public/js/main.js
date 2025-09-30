import Retangulo from './objects/Retangulo.js';
import Slider from './objects/Slider.js';

// --- CONFIGURAÇÃO INICIAL ---
const scene = document.getElementById('scene');
const coordinatesSpan = document.getElementById('coords');

// --- ELEMENTOS DO FORMULÁRIO ---
const formContainer = document.getElementById('form-container');
const objectForm = document.getElementById('object-form');
const formTitle = document.getElementById('form-title');
const addRectBtn = document.getElementById('add-rect-btn');
const addSliderBtn = document.getElementById('add-slider-btn');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');
const duplicateBtn = document.getElementById('duplicate-btn');
const objectIdInput = document.getElementById('object-id');
const objectTypeInput = document.getElementById('object-type');
const rectFields = document.getElementById('rect-fields');
const sliderFields = document.getElementById('slider-fields');


// --- ESTADO DA APLICAÇÃO ---
let isCollisionDetectionActive = true;
const allObjects = []; // Array para armazenar as instâncias dos objetos
const STORAGE_KEY = 'interactive_2d_objects_v5'; // Chave atualizada para nova estrutura

/**
 * Lê os dados dos objetos do localStorage.
 * @returns {Array} - Array de configurações de objetos.
 */
function loadObjectsFromStorage() {
    const objectsJSON = localStorage.getItem(STORAGE_KEY);
    return objectsJSON ? JSON.parse(objectsJSON) : [];
}

/**
 * Salva os dados dos objetos no localStorage.
 * @param {Array} objectsData - Array de configurações de objetos para salvar.
 */
function saveObjectsToStorage(objectsData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(objectsData));
}

/**
 * Verifica a colisão entre dois objetos (AABB).
 */
function checkAABBCollision(objA, objB) {
    if (objA.type === 'slider' || objB.type === 'slider') return false; // Sliders não colidem
    return (
        objA.x < objB.x + objB.largura &&
        objA.x + objA.largura > objB.x &&
        objA.y < objB.y + objB.altura &&
        objA.y + objA.altura > objB.y
    );
}

/**
 * Loop principal da aplicação.
 */
function gameLoop() {
    // Filtra apenas objetos que podem colidir
    const collidableObjects = allObjects.filter(obj => obj.type === 'retangulo');

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
    targetObjectSelect.innerHTML = ''; // Limpa opções existentes
    
    const objectsData = loadObjectsFromStorage();
    const availableTargets = objectsData.filter(obj => obj.type === 'retangulo');

    availableTargets.forEach(target => {
        const option = document.createElement('option');
        option.value = target.id;
        option.textContent = `${target.nome} (${target.id})`;
        if (target.id === currentId) {
            option.selected = true;
        }
        targetObjectSelect.appendChild(option);
    });
}


function openForm(config = null, type) {
    objectForm.reset();
    objectTypeInput.value = type;

    // Esconde todas as seções de campos específicos
    rectFields.classList.add('hidden');
    sliderFields.classList.add('hidden');

    if (config) { // Modo Edição
        formTitle.textContent = `Editar ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        objectIdInput.value = config.id;
        document.getElementById('object-name').value = config.nome;
        document.getElementById('x').value = Math.round(config.x);
        document.getElementById('y').value = Math.round(config.y);
        deleteBtn.classList.remove('hidden');
        duplicateBtn.classList.remove('hidden');
    } else { // Modo Criação
        formTitle.textContent = `Adicionar Novo ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        objectIdInput.value = `${type}_${Date.now()}`;
        document.getElementById('x').value = 50;
        document.getElementById('y').value = 50;
        deleteBtn.classList.add('hidden');
        duplicateBtn.classList.add('hidden');
    }

    if (type === 'retangulo') {
        rectFields.classList.remove('hidden');
        if (config) {
            document.getElementById('largura').value = config.largura;
            document.getElementById('altura').value = config.altura;
            document.getElementById('rotation').value = (config.rotation || 0) * (180 / Math.PI);
            document.getElementById('cor').value = config.collisionHandlers.onNoCollision.cor;
            document.getElementById('cor-colisao').value = config.collisionHandlers.onCollision.cor;
            document.getElementById('reacts-to-collision').checked = config.reactsToCollision;
        } else {
             document.getElementById('object-name').value = 'Novo Retângulo';
        }
    } else if (type === 'slider') {
        sliderFields.classList.remove('hidden');
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
        nome: document.getElementById('object-name').value.trim(),
        x: parseInt(document.getElementById('x').value, 10),
        y: parseInt(document.getElementById('y').value, 10),
    };

    if (type === 'retangulo') {
        return {
            ...commonConfig,
            largura: parseInt(document.getElementById('largura').value, 10),
            altura: parseInt(document.getElementById('altura').value, 10),
            rotation: parseFloat(document.getElementById('rotation').value) * (Math.PI / 180),
            reactsToCollision: document.getElementById('reacts-to-collision').checked,
            collisionHandlers: {
                onCollision: { cor: document.getElementById('cor-colisao').value },
                onNoCollision: { cor: document.getElementById('cor').value }
            }
        };
    } else if (type === 'slider') {
         return {
            ...commonConfig,
            largura: 300, // Largura fixa para sliders
            altura: 50,  // Altura fixa
            targetId: document.getElementById('target-object').value,
            targetProperty: document.getElementById('target-property').value,
            min: parseFloat(document.getElementById('min-value').value),
            max: parseFloat(document.getElementById('max-value').value),
        };
    }
}


function handleFormSubmit(event) {
    event.preventDefault();
    const config = getConfigFromForm();
    const id = config.id;
    
    let objectsData = loadObjectsFromStorage();
    const isEditing = objectsData.some(obj => obj.id === id);

    if (isEditing) {
        const objectInstance = allObjects.find(obj => obj.id === id);
        if (objectInstance) {
            objectInstance.update(config);
        }
        objectsData = objectsData.map(data => data.id === id ? config : data);
    } else {
        if (config.type === 'retangulo') createRetanguloInstance(config);
        else if (config.type === 'slider') createSliderInstance(config);
        objectsData.push(config);
    }
    
    saveObjectsToStorage(objectsData);
    closeForm();
}

function handleDelete() {
    const idToDelete = objectIdInput.value;
    const objectIndex = allObjects.findIndex(obj => obj.id === idToDelete);
    if (objectIndex > -1) {
        allObjects[objectIndex].destroy();
        allObjects.splice(objectIndex, 1);
    }
    let objectsData = loadObjectsFromStorage();
    objectsData = objectsData.filter(data => data.id !== idToDelete);
    saveObjectsToStorage(objectsData);
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
    
    let objectsData = loadObjectsFromStorage();
    objectsData.push(newConfig);
    saveObjectsToStorage(objectsData);
    
    if (newConfig.type === 'retangulo') createRetanguloInstance(newConfig);
    else if (newConfig.type === 'slider') createSliderInstance(newConfig);

    closeForm();
}

// --- INICIALIZAÇÃO E CRIAÇÃO DE INSTÂNCIAS ---

function createRetanguloInstance(config) {
    const newRect = new Retangulo(scene, coordinatesSpan, config, openForm, STORAGE_KEY);
    allObjects.push(newRect);
}

function createSliderInstance(config) {
    const newSlider = new Slider(scene, config, allObjects, openForm, STORAGE_KEY);
    allObjects.push(newSlider);
}

function init() {
    const objectsData = loadObjectsFromStorage();
    if (objectsData.length === 0) {
        // Adiciona um objeto padrão se não houver nada salvo
        const defaultObjects = [
            { id: `retangulo_1`, type: 'retangulo', nome: 'Retângulo Azul', x: 100, y: 150, largura: 150, altura: 80, rotation: 0, reactsToCollision: true, collisionHandlers: { onCollision: { cor: 'rgba(52, 211, 153, 1)' }, onNoCollision: { cor: 'rgba(59, 130, 246, 1)' } } },
        ];
        saveObjectsToStorage(defaultObjects);
        defaultObjects.forEach(data => {
            if (data.type === 'retangulo') createRetanguloInstance(data);
            else if (data.type === 'slider') createSliderInstance(data);
        });
    } else {
        objectsData.forEach(data => {
            if (data.type === 'retangulo') createRetanguloInstance(data);
            else if (data.type === 'slider') createSliderInstance(data);
        });
    }
    
    addRectBtn.addEventListener('click', () => openForm(null, 'retangulo'));
    addSliderBtn.addEventListener('click', () => openForm(null, 'slider'));
    cancelBtn.addEventListener('click', closeForm);
    deleteBtn.addEventListener('click', handleDelete);
    duplicateBtn.addEventListener('click', handleDuplicate);
    objectForm.addEventListener('submit', handleFormSubmit);

    gameLoop();
}

// --- PONTO DE ENTRADA ---
init();

