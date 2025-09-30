Documentação do Projeto 2D Interativo
Este documento descreve a arquitetura, funcionalidades e fluxo de dados do projeto de cena 2D interativa. O objetivo é servir como uma referência técnica para futuras implementações e manutenções.

1. Visão Geral do Projeto
O projeto consiste em uma página web (cena) que permite a criação, manipulação e persistência de objetos 2D. Os usuários podem adicionar objetos visuais (como Retângulos) e objetos de controle (como Sliders) para criar cenas interativas. Todas as configurações são salvas no localStorage do navegador, garantindo que o estado da cena seja preservado entre as sessões.

2. Estrutura de Arquivos
O projeto está organizado de forma modular para facilitar a manutenção e escalabilidade.

index.html: A estrutura principal da página. Contém o contêiner da cena, os elementos da interface do usuário (botões, display de coordenadas) e o formulário modal para edição de objetos.

css/style.css: Contém os estilos personalizados da aplicação, incluindo a aparência da cena, dos objetos e do formulário.

js/main.js: O orquestrador principal da aplicação. É responsável por:

Inicializar a cena e carregar todos os objetos do localStorage.

Gerenciar o "game loop" para detecção de colisão entre retângulos.

Controlar a lógica do formulário modal para todos os tipos de objetos.

Instanciar os objetos na cena.

js/objects/Retangulo.js: Define a classe Retangulo. Encapsula toda a lógica e as propriedades de um objeto retângulo.

js/objects/Slider.js: (Novo) Define a classe Slider. Encapsula a lógica de um objeto de controle que pode manipular as propriedades de outros objetos na cena.

3. Fluxo de Dados e Persistência
A "fonte da verdade" para o estado da cena é o localStorage do navegador, salvo sob a chave interactive_2d_objects_v5.

Armazenamento: Os objetos são armazenados como um array de objetos JSON. Cada objeto no array tem uma propriedade type que define se é um 'retangulo' ou um 'slider'.

Estrutura do JSON:

Retângulo:

{
  "id": "retangulo_166...",
  "type": "retangulo",
  "nome": "Meu Retângulo",
  "x": 100, "y": 150,
  "largura": 150, "altura": 80,
  "rotation": 0,
  "reactsToCollision": true,
  "collisionHandlers": {
    "onCollision": { "cor": "rgba(255, 0, 0, 1)" },
    "onNoCollision": { "cor": "rgba(0, 0, 255, 1)" }
  }
}

Slider (Novo):

{
  "id": "slider_166...",
  "type": "slider",
  "nome": "Controle de Largura",
  "x": 300, "y": 200,
  "largura": 300, "altura": 50,
  "targetId": "retangulo_166...", // ID do objeto a ser controlado
  "targetProperty": "largura", // Propriedade a ser controlada
  "min": 50, // Valor mínimo do slider
  "max": 500 // Valor máximo do slider
}

Carregamento e Interação:

Ao iniciar, main.js lê o array do localStorage e cria as instâncias de Retangulo e Slider apropriadas.

Quando um objeto é arrastado, sua classe (Retangulo ou Slider) atualiza diretamente o localStorage com suas novas coordenadas (X, Y).

Quando o valor de um Slider é alterado, sua classe (Slider.js) encontra o objeto alvo no localStorage, atualiza a propriedade alvo (ex: largura) e, em seguida, chama o método update() da instância do objeto alvo para que a mudança seja refletida visualmente em tempo real.

4. Principais Funcionalidades
Criação de Objetos: Botões permitem adicionar novos Retângulos ou Sliders através de um formulário modal.

Edição: Um duplo clique em qualquer objeto abre o formulário para editar suas propriedades específicas.

Persistência: O estado da cena é salvo e recarregado a cada visita.

Drag and Drop: Todos os objetos podem ser arrastados livremente.

Detecção de Colisão: O gameLoop verifica a colisão entre Retângulos.

Controle de Propriedades via Slider (Novo):

Um objeto Slider pode ser vinculado a qualquer Retângulo na cena.

Ele pode controlar propriedades numéricas como x, y, largura, altura e rotation.

A alteração do valor no slider atualiza a propriedade do objeto alvo em tempo real.

5. Análise dos Arquivos e Funções Chave
js/main.js
openForm(config, type): Lógica aprimorada para exibir campos específicos para 'retangulo' ou 'slider'.

populateTargetObjectDropdown(): (Novo) Popula a lista de objetos alvo no formulário do slider com todos os retângulos disponíveis.

createRetanguloInstance() / createSliderInstance(): Funções para instanciar os respectivos objetos.

js/objects/Retangulo.js
update(config): Método central que permite que suas propriedades sejam alteradas dinamicamente, essencial para a interação com o Slider.

js/objects/Slider.js (Novo)
constructor(..., allObjects, ...): Recebe a lista de todas as instâncias de objetos da cena para poder encontrar seu alvo.

criarElemento(): Constrói a estrutura HTML do objeto, incluindo o <input type="range">.

update(config): Configura as propriedades do slider (min, max, alvo, etc.) e chama updateAppearance.

updateAppearance(): Sincroniza o estado visual do slider (label, min/max, valor atual) com suas propriedades. Ele lê o valor atual da propriedade do objeto alvo para definir a posição inicial do controle deslizante.

handleSliderInput(): A função principal da interatividade. É disparada pelo evento input do slider. Ela:

Encontra a instância do objeto alvo.

Lê os dados do localStorage.

Modifica a propriedade alvo no objeto de dados.

Salva o array de dados completo de volta no localStorage.

Chama o método update() na instância do objeto alvo para aplicar a mudança visual instantaneamente.
