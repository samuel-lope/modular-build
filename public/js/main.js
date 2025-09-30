import Retangulo from './objects/Retangulo.js';

// --- CONFIGURAÇÃO INICIAL ---
const scene = document.getElementById('scene');
const coordinatesSpan = document.getElementById('coords');

// --- SISTEMA DE COLISÃO ---
let isCollisionDetectionActive = true; // Chave geral para ligar/desligar a detecção
const allObjects = []; // Array para armazenar todos os objetos da cena

/**
 * Verifica a colisão entre dois objetos usando o método AABB (Axis-Aligned Bounding Box).
 * Nota: Este método é simples e eficiente, mas não considera a rotação dos objetos.
 * @param {Retangulo} objA - O primeiro objeto.
 * @param {Retangulo} objB - O segundo objeto.
 * @returns {boolean} - Retorna true se houver colisão, senão false.
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
 * Loop principal da aplicação, executado a cada frame.
 * Responsável por verificar e aplicar os estados de colisão.
 */
function gameLoop() {
    if (isCollisionDetectionActive) {
        // 1. Reseta o estado de colisão de todos os objetos
        allObjects.forEach(obj => {
            obj.isColliding = false;
        });

        // 2. Verifica a colisão entre cada par de objetos
        for (let i = 0; i < allObjects.length; i++) {
            for (let j = i + 1; j < allObjects.length; j++) {
                const objA = allObjects[i];
                const objB = allObjects[j];

                if (checkAABBCollision(objA, objB)) {
                    objA.isColliding = true;
                    objB.isColliding = true;
                }
            }
        }

        // 3. Atualiza a aparência de cada objeto com base no seu estado de colisão
        allObjects.forEach(obj => {
            obj.updateAppearance();
        });
    }

    // Continua o loop no próximo frame
    requestAnimationFrame(gameLoop);
}


// --- INICIALIZAÇÃO DO PROJETO ---

// Definindo os comportamentos de colisão para o primeiro retângulo
const retangulo1CollisionHandlers = {
    onCollision: { cor: 'bg-yellow-400' },   // Cor quando estiver colidindo
    onNoCollision: { cor: 'bg-blue-500' }   // Cor quando não estiver colidindo
};

const meuRetangulo = new Retangulo(scene, coordinatesSpan, 200, 515, 80, 150, 'bg-blue-500', { x: 0.5, y: 0.5 }, (2*Math.PI)/360, retangulo1CollisionHandlers);
allObjects.push(meuRetangulo);

// Definindo os comportamentos de colisão para o segundo retângulo
const retangulo2CollisionHandlers = {
    onCollision: { cor: 'bg-yellow-400' },
    onNoCollision: { cor: 'bg-green-500' }
};

const outroRetangulo = new Retangulo(scene, coordinatesSpan, 300, 515, 80, 150, 'bg-green-500', { x: 0.5, y: 0.5 }, (2*Math.PI)/360, retangulo2CollisionHandlers);
allObjects.push(outroRetangulo);

// Inicia o loop da aplicação
gameLoop();

