# Testes de Software — Batalha Naval

## Especificação

Tabuleiro **10 × 10**, com um porta-aviões de 5 casas, um encouraçado de 4, um submarino de 3 e um destroier de 2, conforme o desafio. As regras complementares adotadas são: embarcações retas horizontais ou verticais podem encostar, mas não se sobrepor ou sair do tabuleiro; cada jogador tem uma frota completa; os turnos alternam após qualquer tiro válido; vence quem afundar toda a frota adversária.

## Executar os testes

Requer Node.js 20 ou superior; sem dependências externas.

```sh
npm test
```

Os testes em JavaScript usam `node:test` e `node:assert/strict`. Verificam tamanho da frota, sobreposição, limites, água, acerto, afundamento, visões, turnos, tiros repetidos, frota incompleta e vitória. A saída identifica cada caso e o processo retorna erro quando uma asserção falha.

## Usar o motor

```js
const { Tabuleiro } = require('./src/batalha');
const tabuleiro = new Tabuleiro();
tabuleiro.posicionar('portaAvioes', 0, 0, 'H');
console.log(tabuleiro.tiro(0, 0)); // { resultado: 'acerto', navio: 'portaAvioes' }
```

`posicionar(tipo, linha, coluna, direcao)` usa `H` ou `V` e coordenadas de 0 a 9. `tiro` devolve água, acerto ou afundamento; `visao(true)` revela navios. Para uma partida, posicione todos os quatro tipos em dois objetos distintos e crie `new Partida(tabuleiro0, tabuleiro1)`; use `atirar(jogador, linha, coluna)`. Em um tabuleiro vazio, `posicionarAleatoriamente(rng?)` coloca a frota completa; o gerador opcional retorna números em `[0, 1)`.

## Contrato e organização dos testes

Cada tipo ocorre uma vez e ocupa casas consecutivas para a direita ou para baixo. Posicionamentos inválidos não alteram o tabuleiro. Tiros repetidos e fora dos limites são rejeitados; não mudam a vez. Um navio só afunda após atingir todas as suas casas. A visão usa `~` para desconhecido, `O` para água atingida, `X` para navio atingido e `N` para navio revelado. Depois da vitória, novos tiros são rejeitados.

Os testes em `test/` especificam essas regras com exemplos e verificam cada posição inicial, orientação e tipo de navio; também verificam frotas aleatórias reproduzíveis, dois vencedores possíveis e operações inválidas. O posicionamento aleatório exige tabuleiro sem navios e sem tiros e, se falhar, não altera seu conteúdo.

## Colaborador

Guilherme-Bandeira-Rodrigues
