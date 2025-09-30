import Retangulo from './objects/Retangulo.js';
import Circulo from './objects/Circulo.js';
import Slider from './objects/Slider.js';

// --- CONFIGURAÇÃO INICIAL ---
const scene = document.getElementById('scene');
const coordinatesSpan = document.getElementById('coords');

// --- ELEMENTOS DO FORMULÁRIO ---
const formContainer = document.getElementById('form-container');
const objectForm = document.getElementById('object-form');
const formTitle = document.getElementById('form-title');
const addRectBtn = document.getElementById('add-rect-btn');
const addCircleBtn = document.getElementById('add-circle-btn');
const addSliderBtn = document.getElementById('add-slider-btn');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');
const duplicateBtn = document.getElementById('duplicate-btn');
const objectIdInput = document.getElementById('object-id');
const objectTypeInput = document.getElementById('object-type');

// Grupos de campos
const rectFields = document.getElementById('rect-fields');
const circleFields = document.getElementById('circle-fields');
const shapeCommonFields = document.getElementById('shape-common-fields');
const sliderFields = document.getElementById('slider-fields');


// --- ESTADO DA APLICAÇÃO ---
let isCollisionDetectionActive = true;
const allObjects = []; // Array para armazenar as instâncias dos objetos
const STORAGE_KEY = 'interactive_2d_objects_v6';

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
    // Sliders não colidem
    if (objA.type === 'slider' || objB.type === 'slider') return false; 
    
    // Para círculos, largura e altura são o diâmetro. AABB é uma aproximação.
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
    targetObjectSelect.innerHTML = ''; // Limpa opções existentes
    
    const objectsData = loadObjectsFromStorage();
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

    // Esconde todos os grupos de campos
    rectFields.classList.add('hidden');
    circleFields.classList.add('hidden');
    shapeCommonFields.classList.add('hidden');
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
        document.getElementById('x').value = Math.round(Math.random() * 200 + 50);
        document.getElementById('y').value = Math.round(Math.random() * 200 + 50);
        deleteBtn.classList.add('hidden');
        duplicateBtn.classList.add('hidden');
    }

    if (type === 'retangulo' || type === 'circulo') {
        shapeCommonFields.classList.remove('hidden');
        if (config) {
            document.getElementById('cor').value = config.collisionHandlers.onNoCollision.cor;
            document.getElementById('cor-colisao').value = config.collisionHandlers.onCollision.cor;
            document.getElementById('reacts-to-collision').checked = config.reactsToCollision;
        } else {
             // Valores padrão para novas formas
             document.getElementById('cor').value = 'rgba(59, 130, 246, 1)';
             document.getElementById('cor-colisao').value = 'rgba(239, 68, 68, 1)';
             document.getElementById('reacts-to-collision').checked = true;
        }
    }
    
    if (type === 'retangulo') {
        rectFields.classList.remove('hidden');
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
        circleFields.classList.remove('hidden');
        if (config) {
            document.getElementById('diametro').value = config.diametro;
        } else {
            document.getElementById('object-name').value = 'Novo Círculo';
            document.getElementById('diametro').value = 100;
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
        nome: document.getElementById('object-name').value.trim() || 'Sem nome',
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
            largura: 300,
            altura: 50,
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
    
    let objectsData = loadObjectsFromStorage();
    const isEditing = objectsData.some(obj => obj.id === id);

    if (isEditing) {
        objectsData = objectsData.map(data => (data.id === id ? config : data));
        const objectInstance = allObjects.find(obj => obj.id === id);
        if (objectInstance) {
            objectInstance.update(config);
        }
    } else {
        objectsData.push(config);
        if (config.type === 'retangulo') {
            createRetanguloInstance(config);
        } else if (config.type === 'circulo') {
            createCirculoInstance(config);
        } else if (config.type === 'slider') {
            createSliderInstance(config);
        }
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
    else if (newConfig.type === 'circulo') createCirculoInstance(newConfig);
    else if (newConfig.type === 'slider') createSliderInstance(newConfig);

    closeForm();
}

// --- INICIALIZAÇÃO E CRIAÇÃO DE INSTÂNCIAS ---

function createRetanguloInstance(config) {
    const newRect = new Retangulo(scene, coordinatesSpan, config, openForm, STORAGE_KEY);
    allObjects.push(newRect);
}

function createCirculoInstance(config) {
    const newCircle = new Circulo(scene, coordinatesSpan, config, openForm, STORAGE_KEY);
    allObjects.push(newCircle);
}

function createSliderInstance(config) {
    const newSlider = new Slider(scene, config, allObjects, openForm, STORAGE_KEY);
    allObjects.push(newSlider);
}

function init() {
    const objectsData = loadObjectsFromStorage();
    objectsData.forEach(data => {
        if (data.type === 'retangulo') createRetanguloInstance(data);
        else if (data.type === 'circulo') createCirculoInstance(data);
        else if (data.type === 'slider') createSliderInstance(data);
    });
    
    addRectBtn.addEventListener('click', () => openForm(null, 'retangulo'));
    addCircleBtn.addEventListener('click', () => openForm(null, 'circulo'));
    addSliderBtn.addEventListener('click', () => openForm(null, 'slider'));
    cancelBtn.addEventListener('click', closeForm);
    deleteBtn.addEventListener('click', handleDelete);
    duplicateBtn.addEventListener('click', handleDuplicate);
    objectForm.addEventListener('submit', handleFormSubmit);

    gameLoop();
}

// --- PONTO DE ENTRADA ---
init();

