# Matriz Descritiva de Funções e Propriedades dos Objetos

Este documento detalha as funções (métodos) e as propriedades (características) de cada classe de objeto no projeto. O objetivo é fornecer uma visão completa da arquitetura de cada componente, servindo como uma referência técnica essencial para futuras implementações, depurações e manutenções.

## Arquitetura de Herança

A arquitetura atual é baseada em herança, com uma classe `Objeto2DBase` que centraliza a maior parte da lógica comum.

- **`Objeto2DBase`**: Contém toda a funcionalidade de interação (arrastar e soltar), ciclo de vida (criação, destruição), persistência e a lógica de colisão com barreiras.
- **`Retangulo`, `Circulo`, `Slider`**: São classes filhas que herdam de `Objeto2DBase`. Sua principal responsabilidade é a renderização visual (através do método `updateAppearance`) e a implementação de lógicas específicas ao seu tipo.

## Funções / Métodos

Esta tabela detalha as funções mais importantes. Métodos marcados com `(base)` são implementados na `Objeto2DBase` e herdados pelas classes filhas.

| Função / Método | `Objeto2DBase` (Base) | `Retangulo` / `Circulo` | `Slider` | Descrição | 
| :--- | :--- | :--- | :--- | :--- |
| **constructor(...)** | Sim `(base)` | Sim | Sim | Inicializa o objeto, anexa listeners e chama `update()` e `criarElemento()`. As classes filhas chamam `super()` e podem ter inicializações adicionais. |
| **update(config)** | Sim `(base)` | Sim | Sim | Atualiza o estado interno do objeto a partir de uma nova configuração. As classes filhas chamam `super.update()` e depois atualizam suas propriedades específicas. Ao final, chama `updateAppearance()`. |
| **updateAppearance()**| Não (Abstrato) | Sim | Sim | **Método chave implementado pelas classes filhas.** É responsável por renderizar o objeto no DOM, aplicando todos os estilos (posição, tamanho, cor, rotação) com base no estado atual da instância. |
| **destroy()** | Sim `(base)` | - | - | Remove o elemento HTML do DOM e limpa os listeners para liberar memória. |
| **abrirFormulario()** | Sim `(base)` | - | - | Chamado com duplo clique/toque, abre o modal de edição com os dados do objeto. |
| **iniciarArrasto(e)** | Sim `(base)` | - | - | Inicia o processo de arrastar, registrando a posição inicial do cursor e do objeto. |
| **arrastar(e)** | Sim `(base)` | Sim | - | Executado durante o arrasto. Calcula a nova posição, **verifica colisão com barreiras (`isObstacle`)**, e se o movimento for válido, atualiza as propriedades `x` e `y` e chama `updateAppearance()`. As classes filhas podem sobrescrever para adicionar feedback (ex: mostrar coordenadas). |
| **pararArrasto()** | Sim `(base)` | Sim | - | Finaliza o arrasto e salva a nova posição do objeto no `localStorage`. |
| **handleSliderInput()**| Não | Não | Sim | Método específico do Slider, executado quando seu valor muda. Atualiza a propriedade do objeto alvo. |


## Propriedades

Esta matriz descreve as propriedades de cada classe, que definem o estado e a aparência de cada objeto na cena.

| Propriedade | `Retangulo` | `Circulo` | `Slider` | Descrição | 
| :--- | :--- | :--- | :--- | :--- |
| **id** | Sim | Sim | Sim | Identificador único para cada instância de objeto (ex: `retangulo_166...`). Herdado da base. |
| **type** | Sim | Sim | Sim | Tipo do objeto (ex: `'retangulo'`). Usado para recriar a instância correta. Herdado da base. |
| **nome** | Sim | Sim | Sim | Nome amigável para o objeto, exibido em formulários e tabelas. Herdado da base. |
| **view** | Sim | Sim | Sim | Ordem de exibição (`z-index`). Herdado da base. |
| **x, y** | Sim | Sim | Sim | Coordenadas do canto superior esquerdo do objeto na cena. Herdado da base. |
| **largura** | Sim | Sim | Sim | Largura do objeto em pixels. Para o Círculo, é igual ao diâmetro. |
| **altura** | Sim | Sim | Sim | Altura do objeto em pixels. Para o Círculo, é igual ao diâmetro. |
| **diametro** | Não | Sim | Não | Diâmetro do círculo. Internamente, é usado para definir `largura` e `altura`. |
| **rotation** | Sim | Não | Não | Rotação do objeto em radianos. |
| **reactsToCollision**| Sim | Sim | Não | Booleano que indica se o objeto deve mudar de aparência ao colidir. |
| **isObstacle** | Sim | Sim | Não | **(Nova Funcionalidade)** Booleano que indica se o objeto funciona como uma barreira para outros. |
| **collisionHandlers**| Sim | Sim | Não | Objeto que define as propriedades a serem alteradas em caso de colisão/não colisão. |
| **targetId** | Não | Não | Sim | O `id` do objeto que este slider irá controlar. |
| **targetProperty** | Não | Não | Sim | A propriedade do objeto alvo que será modificada (ex: `'largura'`). |
| **min, max** | Não | Não | Sim | Valores mínimo e máximo para o controle do slider. |