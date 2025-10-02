# Matriz Descritiva de Funções e Propriedades dos Objetos

Este documento detalha as funções (métodos) e as propriedades (características) de cada classe de objeto no projeto. O objetivo é fornecer uma visão completa da arquitetura de cada componente, servindo como uma referência técnica essencial para futuras implementações, depurações e manutenções.

## Funções / Métodos

Esta tabela detalha as funções de cada classe, destacando as responsabilidades individuais e a interface comum que permite que os objetos sejam gerenciados de forma coesa pelo sistema principal.

| Função / Método | Retangulo | Círculo | Slider |
| :--- | :--- | :--- | :--- |
| **constructor(...)** | Sim. Ponto de entrada do objeto. Inicializa suas propriedades a partir do objeto de configuração (config), cria o elemento HTML correspondente na cena e anexa os listeners de eventos essenciais para a interatividade. | Sim. Similar ao Retângulo, inicializa o objeto, define suas propriedades com base na configuração recebida e cria o seu elemento visual no DOM, preparando-o para a interação. | Sim. Constrói o objeto e sua estrutura HTML mais complexa, que inclui o contêiner principal, a etiqueta de texto (`<label>`) e o controle deslizante (`<input type="range">`). Também anexa todos os listeners necessários. |
| **update(config)** | Sim. Método central para a reatividade. Recebe um novo objeto de configuração, geralmente vindo do localStorage após uma edição, e o utiliza para atualizar o estado interno da instância. Ao final, chama `updateAppearance()` para garantir que as mudanças sejam refletidas visualmente. | Sim. Atua como o principal ponto de sincronização. Recebe uma nova configuração, atualiza as propriedades (incluindo o cálculo de largura e altura a partir do diametro para a física) e invoca `updateAppearance()` para renderizar as alterações. | Sim. Recebe uma nova configuração para atualizar suas próprias propriedades (como objeto alvo, min/max, etc.) e chama `updateAppearance()` para que a interface do slider (posição do controle, texto) reflita o estado atual do objeto que ele controla. |
| **updateAppearance()**| Sim. Responsável por toda a renderização. Aplica as propriedades de CSS (posição, tamanho, cor, rotação) ao elemento HTML do objeto com base no estado atual de suas propriedades internas. É chamado pelo `update()` e pelo loop de jogo para refletir colisões. | Sim. Renderiza o objeto, aplicando estilos como cor e, crucialmente, `border-radius: 50%` para criar a forma de um círculo. Também reflete o estado de colisão. | Sim. Atualiza a aparência do slider, movendo o controle deslizante para a posição correta com base no valor atual da propriedade do objeto alvo. Também atualiza o texto da etiqueta para exibir o valor. |
| **toConfig()** | Sim. Serializa o estado atual do objeto (posição, tamanho, cor, etc.) em um objeto de configuração simples (POJO), que é o formato usado para salvar os dados no `localStorage`. | Sim. Gera um objeto de configuração a partir do estado atual da instância, garantindo que todas as suas propriedades sejam salvas corretamente. | Sim. Cria um objeto de configuração contendo todas as suas propriedades, incluindo o ID do objeto alvo e a propriedade que ele controla, para persistência. |
| **destroy()** | Sim. Remove o elemento HTML da cena e desvincula todos os listeners de eventos para liberar recursos e evitar vazamentos de memória. | Sim. Limpa o objeto da cena, removendo seu elemento do DOM e todos os eventos associados. | Sim. Remove todos os elementos HTML associados ao slider (contêiner, etiqueta, input) e seus respectivos listeners. |
| **onDragStart(e)** | Sim. Inicia o processo de arrastar. Registra a posição inicial do mouse e do objeto para calcular o deslocamento durante o movimento. | Sim. Prepara o objeto para ser arrastado, guardando as coordenadas iniciais do evento. | Sim. Permite que o slider (como um todo) seja arrastado pela cena, registrando a posição inicial. |
| **onDrag(e)** | Sim. Executado continuamente enquanto o objeto é arrastado. Calcula a nova posição do objeto com base no movimento do mouse e verifica colisões com obstáculos. Se uma colisão com um obstáculo for detectada, o movimento é impedido. | Sim. Move o objeto de acordo com o ponteiro do mouse, atualizando suas coordenadas `x` e `y` e verificando colisões com obstáculos em tempo real. | Sim. Move o contêiner do slider pela cena conforme o mouse é arrastado. |
| **onDragEnd(e)** | Sim. Finaliza o processo de arrastar. Salva a nova posição do objeto no `localStorage` através da função `saveAllObjects`. | Sim. Conclui a operação de arrastar e dispara o salvamento do estado atual de todos os objetos. | Sim. Termina o arrasto do slider e salva a nova configuração da cena. |

## Propriedades

Esta matriz descreve as propriedades de cada classe, que definem o estado e a aparência de cada objeto na cena.

| Propriedade | Retangulo | Círculo | Slider | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Sim | Sim | Sim | Identificador único para cada instância de objeto (ex: `retangulo_166...`). |
| **type** | Sim | Sim | Sim | Tipo do objeto (ex: `'retangulo'`, `'circulo'`). Usado para recriar a instância correta. |
| **nome** | Sim | Sim | Sim | Nome amigável para o objeto, exibido em formulários e tabelas. |
| **view** | Sim | Sim | Sim | ID da "vista" ou "cena" à qual o objeto pertence. |
| **x, y** | Sim | Sim | Sim | Coordenadas do canto superior esquerdo do objeto na cena. |
| **largura** | Sim | Sim | Sim | Largura do objeto em pixels. |
| **altura** | Sim | Sim | Não | Altura do objeto em pixels. |
| **diametro** | Não | Sim | Não | Diâmetro do círculo. Internamente, é usado para definir `largura` e `altura`. |
| **rotation** | Sim | Não | Não | Rotação do objeto em radianos. |
| **reactsToCollision**| Sim | Sim | Não | Booleano que indica se o objeto deve mudar de aparência ao colidir. |
| **isObstacle** | Sim | Sim | Não | Booleano que indica se o objeto funciona como uma barreira para outros. |
| **collisionHandlers**| Sim | Sim | Não | Objeto que define as propriedades a serem alteradas em caso de colisão/não colisão. |
| **targetId** | Não | Não | Sim | O `id` do objeto que este slider irá controlar. |
| **targetProperty** | Não | Não | Sim | A propriedade do objeto alvo que será modificada (ex: `'largura'`). |
| **min, max** | Não | Não | Sim | Valores mínimo e máximo para o controle do slider. |
