# Documentação do Projeto 2D Interativo

Este documento descreve a arquitetura, funcionalidades e fluxo de dados do projeto de cena 2D interativa.

## 1. Visão Geral

O projeto é uma aplicação web que permite aos usuários criar, manipular e configurar objetos 2D (Retângulos, Círculos, Sliders) em uma área de trabalho (cena). As configurações da cena e dos objetos são salvas no `localStorage` do navegador para persistência.

## 2. Estrutura de Arquivos

- `index.html`: Arquivo principal da aplicação. Contém a estrutura da página, a cena, os botões de controle, o formulário modal para edição de objetos e o modal da tabela de gerenciamento.
- `mobile.html`: Versão da interface otimizada para dispositivos móveis.
- `css/style.css`: Contém estilos CSS personalizados, complementando o framework Tailwind CSS.
- `js/main.js`: O "cérebro" da aplicação. Orquestra a inicialização, o loop de jogo, a detecção de colisão, a criação de instâncias de objetos, e gerencia os modais (formulário e tabela).
- `js/objects/`: Diretório que contém as classes de cada tipo de objeto.
  - `Objeto2DBase.js`: Classe base que contém toda a lógica comum a objetos 2D (arrastar, soltar, destruir, etc.).
  - `Retangulo.js`: Define o comportamento e as propriedades de objetos retangulares.
  - `Circulo.js`: Define o comportamento e as propriedades de objetos circulares.
  - `Slider.js`: Define o comportamento de um objeto slider que pode controlar propriedades de outros objetos.
  - `Grupo.js`: Classe lógica para agrupar e controlar múltiplos objetos como uma unidade.
- `GEMINI.md`: Este arquivo de documentação.
- `MATRIZ_de_OBJETOS.md`: Documentação técnica detalhada sobre as propriedades e métodos de cada classe de objeto.

## 3. Arquitetura e Fluxo de Dados

### 3.1. Inicialização (`init`)

1.  O `main.js` é executado.
2.  A função `init()` é chamada.
3.  **Registro de Tipos de Objeto**: Um objeto `objectTypeRegistry` mapeia os tipos de objeto (ex: `'retangulo'`) para suas respectivas classes (`Retangulo`), IDs de campos de formulário e nomes de exibição.
4.  **Botões Dinâmicos**: Os botões de controle (Adicionar, Gerenciar, etc.) são configurados, recebendo seus ícones e funcionalidades.
5.  **Carregamento de Dados**: Os dados da aplicação (tema e objetos) são lidos do `localStorage` através da `STORAGE_KEY`.
6.  **Criação de Instâncias**: Para cada objeto de configuração encontrado no `localStorage`, a função `createObjectInstance()` é chamada. Ela usa o `objectTypeRegistry` para encontrar a classe correta e criar uma nova instância (ex: `new Retangulo(...)`). Para objetos que necessitam interagir com outros (como para a checagem de barreiras), dependências como a lista de todos os objetos (`allObjects`) são injetadas na instância após a criação.
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

## 4. Classes e Funcionalidades

### 4.1. `Objeto2DBase.js` (Classe Base)

- **Propósito**: Centraliza toda a lógica comum que um objeto 2D interativo precisa.
- **Funcionalidades**:
  - **Ciclo de Vida**: `constructor`, `update`, `destroy`.
  - **Interação**: Lógica completa de arrastar e soltar (`iniciarArrasto`, `arrastar`, `pararArrasto`) para mouse e toque.
  - **Edição**: Abertura do formulário de edição com duplo clique ou toque duplo.
  - **Persistência**: Salva a nova posição no `localStorage` ao final do arrasto.
  - **Lógica de Barreira**: No método `arrastar`, verifica se o movimento colidiria com um objeto marcado como `isObstacle` e, em caso afirmativo, impede o movimento.

### 4.2. Classes Filhas (`Retangulo`, `Circulo`, `Slider`, `Grupo`)

- Herdam de `Objeto2DBase`.
- A principal responsabilidade das classes visuais (`Retangulo`, `Circulo`, `Slider`) é implementar o método `updateAppearance()`, que define como o objeto é renderizado na tela.
- A classe `Grupo` é lógica e usa seus métodos (`update`, `moveBy`) para orquestrar o comportamento de seus objetos filhos.

## 5. Log de Alterações

### 5.1. Mudanças em 02/10/2025 (Implementação de Grupos e Melhorias)

- **Funcionalidade de Agrupamento**: Implementada a capacidade de agrupar múltiplos objetos. 
  - Uma nova classe `Grupo.js` foi criada para gerenciar objetos como uma unidade.
  - A interface do "Gerenciador de Objetos" foi atualizada com checkboxes e um botão "Agrupar" para criar grupos.
  - A lógica de arrastar foi modificada para mover grupos inteiros de forma coesa.
  - Grupos agora podem ser controlados por Sliders.
- **Exclusão de Grupos**: Implementada a lógica para desagrupar objetos quando um grupo é excluído.
- **Melhorias de UI/UX**: A interface foi refinada com ícones, tooltips e um novo layout para os botões de controle.
- **Gerenciamento de Cena**: Adicionadas as funcionalidades de "Limpar Cena", "Baixar JSON" e "Importar JSON".

### 5.2. Mudanças em 03/10/2025 (Correções e Refinamentos)

- **Correção de Bugs Críticos**: Resolvidos múltiplos erros de sintaxe no arquivo `main.js` que impediam a aplicação de ser carregada corretamente. Esses erros foram introduzidos durante a remoção da funcionalidade "Duplicar".
- **Remoção da Funcionalidade "Duplicar"**: A função de duplicar objetos e grupos foi temporariamente removida do formulário de edição para evitar erros e permitir uma futura reimplementação mais estável.
- **Correção no Movimento de Grupos**: Corrigido um bug crítico no método `update` da classe `Grupo.js`. O erro causava um cálculo incorreto da posição do grupo ao ser movido através do formulário de edição, o que impedia o movimento correto. A lógica agora calcula o deslocamento (delta) e o aplica corretamente apenas aos objetos filhos, garantindo que o grupo se mova de forma coesa e previsível.
