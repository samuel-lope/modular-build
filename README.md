# Projeto 2D Interativo

![Static Badge](https://img.shields.io/badge/license-MIT-blue)
![Static Badge](https://img.shields.io/badge/tailwind-v4.1.14-blue)

## 1. Visão Geral

O **Projeto 2D Interativo** é uma aplicação web de código aberto que oferece uma plataforma para a criação e manipulação de cenas 2D diretamente no navegador. A ferramenta permite que os usuários adicionem, configurem e interajam com uma variedade de objetos, como retângulos, círculos e sliders de controle. Todas as informações da cena são salvas localmente no navegador, garantindo a persistência dos dados entre as sessões.

O projeto foi desenvolvido com foco em modularidade e extensibilidade, utilizando uma arquitetura orientada a objetos em JavaScript puro, e estilização moderna com **Tailwind CSS**.

## 2. Funcionalidades Principais

- **Criação de Objetos**: Adicione facilmente novos objetos à cena, incluindo:
  - **Retângulos e Círculos**: Formas geométricas básicas com propriedades customizáveis.
  - **Sliders**: Controles deslizantes que podem ser vinculados a propriedades de outros objetos (como posição, tamanho e rotação) para criar interações dinâmicas.
  - **Grupos**: Agrupe múltiplos objetos para movê-los e manipulá-los como uma única unidade.
- **Manipulação Direta**: Arraste e solte objetos diretamente na cena com suporte para mouse e toque.
- **Edição de Propriedades**: Dê um duplo clique (ou duplo toque) em qualquer objeto para abrir um formulário modal e editar todas as suas propriedades, como nome, cor, tamanho, posição e ordem de exibição (`z-index`).
- **Detecção de Colisão**: Objetos podem ser configurados para reagir visualmente (mudando de cor) quando colidem com outros.
- **Barreiras Intransponíveis**: Configure qualquer objeto como uma "barreira" (`isObstacle`), impedindo que outros objetos arrastáveis passem por ele.
- **Gerenciamento de Cena Completo**:
  - **Limpar Cena**: Remova todos os objetos da cena com um único clique.
  - **Exportar (Baixar JSON)**: Salve o estado completo da sua cena em um arquivo JSON local.
  - **Importar (Carregar JSON)**: Carregue uma cena previamente salva a partir de um arquivo JSON.
- **Persistência Automática**: Todas as alterações são salvas automaticamente no `localStorage` do navegador.
- **Interface Responsiva**: Inclui uma visualização otimizada para dispositivos móveis (`mobile.html`).

## 3. Como Executar o Projeto

Este projeto utiliza `npm` para gerenciar as dependências de desenvolvimento, principalmente o Tailwind CSS.

### Pré-requisitos

- [Node.js](https://nodejs.org/) e `npm` instalados.

### Passos para Instalação e Execução

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/modular-build.git
    cd modular-build
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Compile o CSS do Tailwind:**

    O projeto usa o Tailwind CSS para a estilização. Execute o seguinte comando para compilar os arquivos de estilo:

    ```bash
    npm run build-css
    ```

    Este comando irá processar o arquivo `src/input.css` e gerar o `public/build.css`, que é o arquivo de estilo utilizado pela aplicação.

4.  **Abra o arquivo `index.html`:**

    Após a compilação, basta abrir o arquivo `public/index.html` em seu navegador de preferência.

    ```bash
    # Exemplo (em sistemas com suporte ao comando `open` ou `start`)
    start public/index.html
    ```

## 4. Estrutura do Projeto

```
modular-build/
├── public/
│   ├── css/style.css         # Estilos CSS personalizados
│   ├── js/
│   │   ├── objects/          # Classes dos objetos (Retangulo, Circulo, etc.)
│   │   └── main.js           # Lógica principal da aplicação
│   ├── build.css             # Arquivo CSS gerado pelo Tailwind
│   ├── index.html            # Interface principal para desktop
│   └── mobile.html           # Interface otimizada para mobile
├── src/
│   ├── input.css             # Arquivo de entrada para o Tailwind CSS
│   └── worker.js             # (Não utilizado no frontend estático)
├── package.json              # Dependências e scripts do projeto
├── tailwind.config.js        # Arquivo de configuração do Tailwind
└── README.md                 # Este arquivo
```

## 5. Arquitetura do Código

O coração da aplicação reside em sua arquitetura JavaScript orientada a objetos, projetada para ser clara e extensível.

### Classe Base: `Objeto2DBase.js`

Esta é a classe "mãe" de todos os objetos da cena. Ela encapsula a lógica comum e essencial, incluindo:

- **Ciclo de vida**: `constructor`, `update`, `destroy`.
- **Interação**: Lógica completa de arrastar e soltar para mouse e toque.
- **Persistência**: Métodos para salvar o estado do objeto no `localStorage`.
- **Lógica de Barreira**: Implementação da funcionalidade que impede o movimento através de objetos marcados como `isObstacle`.

### Classes Filhas (Ex: `Retangulo.js`, `Circulo.js`, `Slider.js`)

Cada tipo de objeto possui sua própria classe que herda de `Objeto2DBase`. A principal responsabilidade de uma classe filha é implementar o método `updateAppearance()`. Este método define como o objeto é renderizado visualmente na tela, aplicando estilos como cor, tamanho e posição com base em suas propriedades atuais.

### Orquestração: `main.js`

Este arquivo atua como o ponto de entrada e o controlador principal da aplicação. Suas responsabilidades incluem:

- **Inicialização**: Carregar dados do `localStorage` e recriar as instâncias de objetos na cena.
- **Loop de Jogo (`gameLoop`)**: Um loop contínuo (`requestAnimationFrame`) que verifica a detecção de colisão e atualiza a aparência dos objetos.
- **Gerenciamento de UI**: Controlar a abertura e o fechamento dos modais de edição e da tabela de gerenciamento de objetos.
- **Gerenciamento de Cena**: Implementar a lógica para os botões de limpar, exportar e importar.

## 6. Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
