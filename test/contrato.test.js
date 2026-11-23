"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { FROTA, Tabuleiro, Partida } = require("../src/batalha");
const tipos = { portaAvioes: 5, encouracado: 4, submarino: 3, destroier: 2 };
function completo() {
  const t = new Tabuleiro();
  Object.keys(tipos).forEach((tipo, l) => t.posicionar(tipo, l, 0, "H"));
  return t;
}
test("contrato: um navio de cada tipo ocupa 14 casas de um tabuleiro 10 × 10", () => {
  assert.deepEqual(FROTA, tipos);
  const t = completo(),
    v = t.visao(true);
  assert.equal(v.length, 10);
  assert.ok(v.every((l) => l.length === 10));
  assert.equal(v.flat().filter((c) => c === "N").length, 14);
});
for (const [tipo, tamanho] of Object.entries(tipos))
  for (const direcao of ["H", "V"]) {
    test(`${tipo}: todas as posições ${direcao} respeitam bordas e comprimento ${tamanho}`, () => {
      for (let l = 0; l < 10; l++)
        for (let c = 0; c < 10; c++) {
          const t = new Tabuleiro();
          const cabe = direcao === "H" ? c + tamanho <= 10 : l + tamanho <= 10;
          if (!cabe) {
            assert.throws(() => t.posicionar(tipo, l, c, direcao), RangeError);
            assert.equal(
              t
                .visao(true)
                .flat()
                .filter((x) => x === "N").length,
              0,
            );
            continue;
          }
          t.posicionar(tipo, l, c, direcao);
          const v = t.visao(true);
          assert.equal(v.flat().filter((x) => x === "N").length, tamanho);
          for (let i = 0; i < tamanho; i++)
            assert.equal(
              v[l + (direcao === "V" ? i : 0)][c + (direcao === "H" ? i : 0)],
              "N",
            );
        }
    });
  }
for (const [l, c] of [
  [-1, 0],
  [0, -1],
  [10, 0],
  [0, 10],
  [1.5, 0],
  ["0", 1],
  [NaN, 1],
  [null, 0],
])
  test(`tiro fora dos limites ou inválido (${l}, ${c}) não altera visão`, () => {
    const t = completo(),
      antes = t.visao(true);
    assert.throws(() => t.tiro(l, c), RangeError);
    assert.deepEqual(t.visao(true), antes);
  });
for (const tipo of Object.keys(tipos))
  test(`rejeita segundo ${tipo}`, () => {
    const t = new Tabuleiro();
    t.posicionar(tipo, 0, 0, "H");
    const antes = t.visao(true);
    assert.throws(() => t.posicionar(tipo, 5, 0, "H"));
    assert.deepEqual(t.visao(true), antes);
  });
test("navios adjacentes são permitidos, interseção não altera tabuleiro", () => {
  const t = new Tabuleiro();
  t.posicionar("portaAvioes", 0, 0, "H");
  t.posicionar("submarino", 1, 0, "H");
  const antes = t.visao(true);
  assert.throws(() => t.posicionar("encouracado", 0, 4, "V"));
  assert.deepEqual(t.visao(true), antes);
});
for (const tipo of Object.keys(tipos))
  test(`cada casa de ${tipo} deve ser atingida para afundar`, () => {
    const t = new Tabuleiro();
    t.posicionar(tipo, 4, 2, "H");
    for (let i = tipos[tipo] - 1; i >= 0; i--) {
      const r = t.tiro(4, 2 + i);
      assert.deepEqual(r, {
        resultado: i === 0 ? "afundou" : "acerto",
        navio: tipo,
      });
    }
  });
test("tirar duas vezes na água ou no navio falha e não muda a visão", () => {
  const t = completo();
  t.tiro(0, 0);
  t.tiro(9, 9);
  const v = t.visao(true);
  assert.throws(() => t.tiro(0, 0));
  assert.throws(() => t.tiro(9, 9));
  assert.deepEqual(t.visao(true), v);
});
test("antes da última casa atingida não há derrota; após ela há", () => {
  const t = completo(),
    alvos = Object.entries(tipos).flatMap(([, n], l) =>
      Array.from({ length: n }, (_, c) => [l, c]),
    );
  alvos.forEach(([l, c], i) => {
    assert.equal(t.derrotado(), false);
    t.tiro(l, c);
    if (i < 13) assert.equal(t.derrotado(), false);
  });
  assert.equal(t.derrotado(), true);
});
test("cada visão é uma cópia e o tabuleiro vazio não está pronto", () => {
  const t = new Tabuleiro();
  assert.equal(t.pronto(), false);
  assert.equal(t.derrotado(), false);
  const v = t.visao(true);
  v[0][0] = "X";
  assert.equal(t.visao(true)[0][0], "~");
});
test("tabuleiros devem ser distintos e completos", () => {
  const t = completo();
  assert.throws(() => new Partida(t, t));
  assert.throws(() => new Partida(t, new Tabuleiro()));
  assert.throws(() => new Partida(null, t));
});
for (const primeiro of [0, 1])
  test(`tiro do jogador ${primeiro} atinge somente o adversário`, () => {
    const a = completo(),
      b = completo(),
      j = new Partida(a, b);
    if (primeiro === 1) j.atirar(0, 9, 9);
    const proprio = j.tabuleiros[primeiro],
      alvo = j.tabuleiros[1 - primeiro];
    j.atirar(primeiro, 0, 0);
    assert.equal(alvo.visao()[0][0], "X");
    assert.equal(proprio.visao()[0][0], "~");
  });
test("erro de turno, repetição e coordenada inválida não passam a vez", () => {
  const j = new Partida(completo(), completo());
  assert.throws(() => j.atirar(1, 0, 0));
  assert.equal(j.vez, 0);
  j.atirar(0, 0, 0);
  j.atirar(1, 0, 0);
  assert.throws(() => j.atirar(0, 0, 0));
  assert.equal(j.vez, 0);
  assert.throws(() => j.atirar(0, 10, 0), RangeError);
  assert.equal(j.vez, 0);
});
