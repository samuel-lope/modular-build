# Documentação do Projeto 2D Interativo

Este documento descreve a arquitetura, funcionalidades e fluxo de dados do projeto de cena 2D interativa.

## 1. Visão Geral

O projeto é uma aplicação web que permite aos usuários criar, manipular e configurar objetos 2D (Retângulos, Círculos, Sliders) em uma área de trabalho (cena). As configurações da cena e dos objetos são salvas no `localStorage` do navegador para persistência.

## 2. Estrutura de Arquivos

- `index.html`: Arquivo principal da aplicação. Contém a estrutura da página, a cena, os botões de controle, o formulário modal para edição de objetos e o modal da tabela de gerenciamento.
- `css/style.css`: Contém estilos CSS personalizados, complementando o framework Tailwind CSS.
- `js/main.js`: O "cérebro" da aplicação. Orquestra a inicialização, o loop de jogo, a detecção de colisão, a criação de instâncias de objetos, e gerencia os modais (formulário e tabela).
- `js/objects/`: Diretório que contém as classes de cada tipo de objeto.
  - `Retangulo.js`: Define o comportamento e as propriedades de objetos retangulares.
  - `Circulo.js`: Define o comportamento e as propriedades de objetos circulares.
  - `Slider.js`: Define o comportamento de um objeto slider que pode controlar propriedades de outros objetos.
- `GEMINI.md`: Este arquivo de documentação.

## 3. Arquitetura e Fluxo de Dados

### 3.1. Inicialização (`init`)

1.  O `main.js` é executado.
2.  A função `init()` é chamada.
3.  **Registro de Tipos de Objeto**: Um objeto `objectTypeRegistry` mapeia os tipos de objeto (ex: `'retangulo'`) para suas respectivas classes (`Retangulo`), IDs de campos de formulário e nomes de exibição.
4.  **Botões Dinâmicos**: Os botões "Adicionar..." são gerados dinamicamente com base nas entradas do `objectTypeRegistry`.
5.  **Carregamento de Dados**: Os dados da aplicação (tema e objetos) são lidos do `localStorage` através da `STORAGE_KEY`.
6.  **Criação de Instâncias**: Para cada objeto de configuração encontrado no `localStorage`, a função `createObjectInstance()` é chamada. Ela usa o `objectTypeRegistry` para encontrar a classe correta e criar uma nova instância (ex: `new Retangulo(...)`).
7.  **Loop Principal**: O `gameLoop()` é iniciado usando `requestAnimationFrame`.

### 3.2. O Loop Principal (`gameLoop`)

- Roda continuamente (~60 vezes por segundo).
- **Detecção de Colisão**:
  - Filtra todos os objetos que podem colidir.
  - Compara cada par de objetos usando a função `checkAABBCollision`.
  - Se uma colisão é detectada e o objeto está configurado para reagir (`reactsToCollision`), sua propriedade interna `isColliding` é definida como `true`.
- **Atualização Visual**: Chama o método `updateAppearance()` de cada objeto para que eles possam reagir visualmente ao seu estado (ex: mudar de cor se `isColliding` for `true`).

### 3.3. Persistência de Dados (`localStorage`)

- Todos os dados persistentes são armazenados sob uma única chave no `localStorage` (`interactive_2d_app_data_v1`).
- O valor é uma string JSON contendo um objeto com duas chaves principais: `theme` e `objects`.

#### Estrutura do JSON

```json
{
  "theme": {
    "backgroundColor": "#374151"
  },
  "objects": [
    {
      "id": "retangulo_166...",
      "type": "retangulo",
      "nome": "Meu Retângulo",
      "view": 0,
      "x": 100,
      "y": 150,
      "largura": 150,
      "altura": 80,
      "rotation": 0.5,
      "reactsToCollision": true,
      "isObstacle": false,
      "collisionHandlers": {
        "onCollision": { "cor": "rgba(239, 68, 68, 1)" },
        "onNoCollision": { "cor": "rgba(59, 130, 246, 1)" }
      }
    },
    {
      "id": "slider_167...",
      "type": "slider",
      "nome": "Controle de Largura",
      "view": 1,
      "x": 50,
      "y": 300,
      "largura": 300,
      "altura": 50,
      "targetId": "retangulo_166...",
      "targetProperty": "largura",
      "min": 50,
      "max": 500
    }
  ]
}
```

- `theme`: Armazena configurações globais de aparência, como a cor de fundo da cena.
- `objects`: É um array de objetos, onde cada objeto representa a configuração de uma instância na cena.

## 4. Funcionalidades e Classes de Objeto

### 4.1. Funcionalidades Globais

- **Adicionar Objetos**: Botões gerados dinamicamente abrem o formulário modal para criar novos objetos.
- **Formulário Modal**: Um único formulário que se adapta para mostrar os campos relevantes para o tipo de objeto que está sendo criado ou editado.
- **Arrastar e Soltar**: Objetos móveis podem ser arrastados pela cena. A posição é salva no `localStorage` ao soltar o objeto.
- **Edição (Duplo Clique)**: Um duplo clique em qualquer objeto abre o formulário modal pré-preenchido com suas configurações.
- **Gerenciador de Objetos**: Um modal de tabela exibe todos os objetos e permite a edição direta de suas propriedades.
- **Personalização de Tema**: Um seletor de cor permite alterar a cor de fundo da cena, e a escolha é persistida.

### 4.2. Classe `Retangulo.js`

- **Propriedades**: `largura`, `altura`, `rotation`.
- **Funcionalidades**: Pode ser arrastado, reage à colisão mudando de cor e suas propriedades podem ser controladas por um `Slider`. Pode opcionalmente ser configurado para atuar como um obstáculo, impedindo que outros objetos o atravessem.

### 4.3. Classe `Circulo.js`

- **Propriedades**: `diametro`. (Internamente, usa `largura` e `altura` iguais ao diâmetro para a detecção de colisão AABB).
- **Funcionalidades**: Similar ao `Retangulo`. Pode ser arrastado, reage à colisão e pode ser controlado por um `Slider`. Visualmente é renderizado com `border-radius: 50%`. Pode opcionalmente ser configurado para atuar como um obstáculo.

### 4.4. Classe `Slider.js`

- **Propriedades**: `targetId`, `targetProperty`, `min`, `max`.
- **Funcionalidades**: Exibe um controle deslizante. Ao ser alterado, ele modifica em tempo real a propriedade (`targetProperty`) do objeto alvo (`targetId`). Pode ser arrastado pela cena.

## 5. Correções Recentes (01/10/2025)

- **Correção de Bug Crítico no Formulário:**
  - **Problema:** Um erro de digitação e uma `div` mal posicionada no `index.html` faziam com que o formulário de criação/edição de objetos falhasse ao tentar adicionar um `Slider`, causando um erro (`Cannot set properties of null`) e desconfigurando o formulário para `Retangulo` e `Círculo`.
  - **Solução:** O HTML do formulário foi reestruturado, garantindo que todos os campos, especialmente os do `Slider` (`target-object`), existam e estejam corretamente aninhados. A função `openForm` em `main.js` também foi ajustada para garantir que os campos corretos sejam exibidos para cada tipo de objeto.

- **Implementação da Funcionalidade "Obstáculo":**
  - **Problema:** A lógica para a nova funcionalidade "obstáculo" estava incompleta e causando erros.
  - **Solução:**
    - O formulário em `index.html` agora inclui um checkbox `is-obstacle`.
    - A função `getConfigFromForm` em `main.js` foi atualizada para ler o estado deste checkbox.
    - A função `openForm` agora define o valor do checkbox ao editar um objeto existente ou um valor padrão ao criar um novo.

- **Refatoração e Injeção de Dependência:**
  - **Problema:** As classes `Retangulo` e `Circulo` recebiam dependências (`allObjectInstances`, `collisionChecker`) em seus construtores, mas a lógica de arrasto com obstáculos não estava funcionando corretamente e o acoplamento era alto.
  - **Solução:**
    - Os construtores de `Retangulo` e `Circulo` foram simplificados, removendo os parâmetros extras.
    - A função `createObjectInstance` em `main.js` foi modificada para "injetar" as dependências (`allObjects` e `checkAABBCollision`) diretamente nas instâncias dos objetos após sua criação. Isso desacoplou as classes e garantiu que a lógica de detecção de colisão com obstáculos funcione como esperado durante o arrasto.
