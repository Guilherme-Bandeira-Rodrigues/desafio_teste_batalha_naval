const { test } = require("node:test");
const assert = require("node:assert/strict");
const { FROTA, Tabuleiro, Partida } = require("../src/batalha");
function frota() {
  const t = new Tabuleiro();
  Object.keys(FROTA).forEach((tipo, linha) =>
    t.posicionar(tipo, linha, 0, "H"),
  );
  return t;
}
test("valida tipo, direção, duplicação e limites do navio", () => {
  const t = new Tabuleiro();
  assert.throws(() => t.posicionar("canoa", 0, 0, "H"));
  assert.throws(() => t.posicionar("submarino", 0, 0, "diagonal"));
  t.posicionar("submarino", 7, 9, "V");
  assert.throws(() => t.posicionar("submarino", 0, 0, "H"));
  assert.throws(() => t.posicionar("destroier", 9, 8, "V"), RangeError);
});
test("visão oculta navios até que sejam atingidos", () => {
  const t = frota();
  assert.equal(t.visao()[0][0], "~");
  assert.equal(t.visao(true)[0][0], "N");
  t.tiro(0, 0);
  t.tiro(9, 9);
  assert.equal(t.visao()[0][0], "X");
  assert.equal(t.visao()[9][9], "O");
});
test("navio afunda apenas após o último acerto, em qualquer ordem", () => {
  const t = frota();
  assert.equal(t.tiro(2, 2).resultado, "acerto");
  assert.equal(t.tiro(2, 0).resultado, "acerto");
  assert.equal(t.tiro(2, 1).resultado, "afundou");
});
test("jogador 1 também pode vencer", () => {
  const p = new Partida(frota(), frota());
  const alvos = Object.values(FROTA).flatMap((n, l) =>
    Array.from({ length: n }, (_, c) => [l, c]),
  );
  alvos.forEach(([l, c], i) => {
    p.atirar(0, 8 + Math.floor(i / 10), i % 10);
    p.atirar(1, l, c);
  });
  assert.equal(p.vencedor, 1);
});
