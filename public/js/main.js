import Retangulo from './objects/Retangulo.js';

// --- CONFIGURAÇÃO INICIAL ---
const scene = document.getElementById('scene');
const coordinatesSpan = document.getElementById('coords');

// --- ELEMENTOS DO FORMULÁRIO ---
const formContainer = document.getElementById('form-container');
const objectForm = document.getElementById('object-form');
const formTitle = document.getElementById('form-title');
const addRectBtn = document.getElementById('add-rect-btn');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');
const duplicateBtn = document.getElementById('duplicate-btn');
const objectIdInput = document.getElementById('object-id');

// --- ESTADO DA APLICAÇÃO ---
let isCollisionDetectionActive = true;
const allObjects = []; // Array para armazenar as instâncias dos objetos
const STORAGE_KEY = 'interactive_2d_objects_v4'; // Chave atualizada para nova estrutura

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
    if (isCollisionDetectionActive) {
        allObjects.forEach(obj => { obj.isColliding = false; });

        for (let i = 0; i < allObjects.length; i++) {
            for (let j = i + 1; j < allObjects.length; j++) {
                const objA = allObjects[i];
                const objB = allObjects[j];

                if (checkAABBCollision(objA, objB)) {
                    if (objA.reactsToCollision) {
                        objA.isColliding = true;
                    }
                    if (objB.reactsToCollision) {
                        objB.isColliding = true;
                    }
                }
            }
        }
        allObjects.forEach(obj => { obj.updateAppearance(); });
    }
    requestAnimationFrame(gameLoop);
}

// --- LÓGICA DO FORMULÁRIO ---

function openForm(config = null) {
    objectForm.reset();
    if (config) { // Modo Edição
        formTitle.textContent = 'Editar Retângulo';
        objectIdInput.value = config.id; // ID estável
        document.getElementById('object-name').value = config.nome; // Nome personalizável
        document.getElementById('largura').value = config.largura;
        document.getElementById('altura').value = config.altura;
        document.getElementById('x').value = Math.round(config.x);
        document.getElementById('y').value = Math.round(config.y);
        document.getElementById('rotation').value = config.rotation * (180 / Math.PI);
        document.getElementById('cor').value = config.collisionHandlers.onNoCollision.cor;
        document.getElementById('cor-colisao').value = config.collisionHandlers.onCollision.cor;
        document.getElementById('reacts-to-collision').checked = config.reactsToCollision;
        deleteBtn.classList.remove('hidden');
        duplicateBtn.classList.remove('hidden');
    } else { // Modo Criação
        formTitle.textContent = 'Adicionar Novo Retângulo';
        objectIdInput.value = `rect_${Date.now()}`; // Gera um novo ID estável
        document.getElementById('object-name').value = 'Novo Retângulo'; // Nome padrão
        document.getElementById('largura').value = 100;
        document.getElementById('altura').value = 50;
        document.getElementById('x').value = 50;
        document.getElementById('y').value = 50;
        document.getElementById('cor').value = 'rgba(139, 92, 246, 1)'; 
        document.getElementById('cor-colisao').value = 'rgba(251, 146, 60, 1)';
        document.getElementById('reacts-to-collision').checked = true;
        deleteBtn.classList.add('hidden');
        duplicateBtn.classList.add('hidden');
    }
    formContainer.classList.remove('hidden');
}

function closeForm() {
    formContainer.classList.add('hidden');
}

function getConfigFromForm() {
    return {
        id: objectIdInput.value, // O ID vem do campo oculto e não muda
        nome: document.getElementById('object-name').value.trim(), // O nome vem do campo de texto
        x: parseInt(document.getElementById('x').value, 10),
        y: parseInt(document.getElementById('y').value, 10),
        largura: parseInt(document.getElementById('largura').value, 10),
        altura: parseInt(document.getElementById('altura').value, 10),
        rotation: parseFloat(document.getElementById('rotation').value) * (Math.PI / 180),
        reactsToCollision: document.getElementById('reacts-to-collision').checked,
        collisionHandlers: {
            onCollision: { cor: document.getElementById('cor-colisao').value },
            onNoCollision: { cor: document.getElementById('cor').value }
        }
    };
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
        createRetanguloInstance(config);
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
        id: `rect_${Date.now()}`, // Cria um novo ID único
        nome: `${config.nome} (cópia)`, // Adiciona um sufixo ao nome
        x: config.x + 20,
        y: config.y + 20,
    };
    
    let objectsData = loadObjectsFromStorage();
    objectsData.push(newConfig);
    saveObjectsToStorage(objectsData);
    
    createRetanguloInstance(newConfig);
    closeForm();
}

// --- INICIALIZAÇÃO E CRIAÇÃO DE INSTÂNCIAS ---

function createRetanguloInstance(config) {
    // CORREÇÃO: Passando a STORAGE_KEY para o construtor do objeto.
    const newRect = new Retangulo(scene, coordinatesSpan, config, openForm, STORAGE_KEY);
    allObjects.push(newRect);
}

function init() {
    const objectsData = loadObjectsFromStorage();
    if (objectsData.length === 0) {
        const defaultObjects = [
            { id: `rect_1`, nome: 'Retângulo Azul', x: 100, y: 150, largura: 150, altura: 80, rotation: 0, reactsToCollision: true, collisionHandlers: { onCollision: { cor: 'rgba(52, 211, 153, 1)' }, onNoCollision: { cor: 'rgba(59, 130, 246, 1)' } } },
            { id: `rect_2`, nome: 'Quadrado Vermelho', x: 300, y: 200, largura: 100, altura: 100, rotation: Math.PI / 4, reactsToCollision: true, collisionHandlers: { onCollision: { cor: 'rgba(250, 204, 21, 1)' }, onNoCollision: { cor: 'rgba(239, 68, 68, 1)' } } }
        ];
        saveObjectsToStorage(defaultObjects);
        defaultObjects.forEach(createRetanguloInstance);
    } else {
        objectsData.forEach(createRetanguloInstance);
    }
    
    addRectBtn.addEventListener('click', () => openForm(null));
    cancelBtn.addEventListener('click', closeForm);
    deleteBtn.addEventListener('click', handleDelete);
    duplicateBtn.addEventListener('click', handleDuplicate);
    objectForm.addEventListener('submit', handleFormSubmit);

    gameLoop();
}

// --- PONTO DE ENTRADA ---
init();

