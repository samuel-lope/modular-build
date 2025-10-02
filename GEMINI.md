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

### 4.2. Classes Filhas (`Retangulo`, `Circulo`, `Slider`)

- Herdam de `Objeto2DBase`.
- Seus construtores chamam `super()` e depois cuidam de suas inicializações específicas.
- A principal responsabilidade é implementar o método `updateAppearance()`, que define como o objeto é renderizado na tela (tamanho, cor, forma, etc.).
- Podem ter propriedades e métodos específicos, como o `handleSliderInput` da classe `Slider`.

## 5. Novas Funcionalidades e Melhorias (02/10/2025)

Esta seção detalha as mudanças mais recentes implementadas no projeto.

### 5.1. Refatoração da Arquitetura de Objetos

- **Classe Base `Objeto2DBase`**: Foi introduzida uma classe base para todos os objetos da cena. Esta refatoração crucial limpou o código das classes `Retangulo`, `Circulo` e `Slider`, centralizando toda a lógica duplicada de arrastar e soltar, ciclo de vida (criação, atualização, destruição) e persistência em um único local. Isso torna o código mais limpo, fácil de manter e estender.

### 5.2. Funcionalidade de "Barreira"

- **Propriedade `isObstacle`**: Foi implementada a funcionalidade de "barreira". Agora, `Retangulo` e `Circulo` podem ser marcados como intransponíveis.
- **Interface**: Um checkbox "É uma barreira (intransponível)" foi adicionado ao formulário de edição.
- **Lógica**: A lógica de colisão foi adicionada diretamente ao método `arrastar` da classe `Objeto2DBase`. Antes de mover um objeto, ele verifica se a nova posição o faria colidir com qualquer outro objeto marcado como `isObstacle`. Se uma colisão for detectada, o movimento é prevenido.

### 5.3. Melhorias de UI/UX

- **Botões com Ícones**: Todos os botões de controle principais (`Adicionar...`, `Gerenciar Objetos`, `Limpar Cena`, `Baixar JSON`) foram convertidos de texto para ícones SVG. O texto descritivo agora aparece como um tooltip (dica de ferramenta) quando o usuário passa o mouse sobre o botão, resultando em uma interface mais limpa e moderna.
- **Layout dos Controles**: Em `index.html`, os botões de ação global ("Gerenciar Objetos", "Limpar Cena" e "Baixar JSON") foram agrupados no canto superior direito da tela para uma melhor organização e acesso rápido.

### 5.4. Gerenciamento de Cena

- **Limpar Cena**: Um novo botão foi adicionado, permitindo ao usuário remover todos os objetos da cena de uma só vez. A ação pede confirmação, limpa os dados do `localStorage` e recarrega a página.
- **Baixar JSON**: Foi adicionado um botão que permite ao usuário exportar o estado completo da cena (incluindo as configurações de tema e todos os objetos) como um arquivo `.json`. Isso permite fazer backup e compartilhar as criações.
