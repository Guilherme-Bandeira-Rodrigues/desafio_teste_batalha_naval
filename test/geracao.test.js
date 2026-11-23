"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { FROTA, Tabuleiro } = require("../src/batalha");
function rng(s) {
  return () => ((s = (s * 48271) % 2147483647) - 1) / 2147483646;
}
for (const seed of [
  1, 2, 3, 4, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
])
  test(`frota aleatória ${seed} tem navios retos, contínuos e sem sobreposição`, () => {
    const t = new Tabuleiro();
    t.posicionarAleatoriamente(rng(seed));
    assert.equal(t.pronto(), true);
    const mapa = t.visao(true);
    assert.equal(mapa.flat().filter((x) => x === "N").length, 14);
    assert.deepEqual([...t.navios.keys()].sort(), Object.keys(FROTA).sort());
    for (const [tipo, casas] of t.navios) {
      assert.equal(casas.length, FROTA[tipo]);
      assert.equal(new Set(casas.map((p) => p.join(","))).size, casas.length);
      assert.ok(
        casas.every(
          ([l, c]) =>
            l >= 0 && l < 10 && c >= 0 && c < 10 && mapa[l][c] === "N",
        ),
      );
      const ls = new Set(casas.map((p) => p[0])),
        cs = new Set(casas.map((p) => p[1]));
      assert.ok(ls.size === 1 || cs.size === 1);
      const eixo =
        ls.size === 1 ? casas.map((p) => p[1]) : casas.map((p) => p[0]);
      assert.equal(Math.max(...eixo) - Math.min(...eixo), casas.length - 1);
    }
  });
test("mesma semente gera mesma frota; sementes distintas produzem diversidade", () => {
  const gerar = (s) => {
    const t = new Tabuleiro();
    t.posicionarAleatoriamente(rng(s));
    return t.visao(true);
  };
  assert.deepEqual(gerar(71), gerar(71));
  assert.ok(
    new Set([1, 2, 3, 4].map((x) => JSON.stringify(gerar(x)))).size > 1,
  );
});
for (const valor of [0, 0.999999999])
  test(`rng constante ${valor} não impede a montagem`, () => {
    const t = new Tabuleiro();
    t.posicionarAleatoriamente(() => valor);
    assert.equal(t.pronto(), true);
    assert.equal(
      t
        .visao(true)
        .flat()
        .filter((x) => x === "N").length,
      14,
    );
  });
test("posicionamento aleatório não modifica tabuleiro já iniciado", () => {
  const t = new Tabuleiro();
  t.posicionar("destroier", 0, 0, "H");
  const antes = t.visao(true);
  assert.throws(() => t.posicionarAleatoriamente(rng(1)));
  assert.deepEqual(t.visao(true), antes);
  const outro = new Tabuleiro();
  outro.tiro(9, 9);
  assert.throws(() => outro.posicionarAleatoriamente(rng(1)));
});
for (const v of [null, 5, "x"])
  test(`não aceita rng não funcional: ${v}`, () => {
    const t = new Tabuleiro();
    assert.throws(() => t.posicionarAleatoriamente(v), TypeError);
    assert.equal(t.pronto(), false);
  });
for (const v of [-1, 1, NaN, Infinity, "0"])
  test(`rng inválido ${v} falha sem alterar a frota`, () => {
    const t = new Tabuleiro();
    assert.throws(() => t.posicionarAleatoriamente(() => v), RangeError);
    assert.equal(t.pronto(), false);
    assert.equal(
      t
        .visao(true)
        .flat()
        .filter((x) => x === "N").length,
      0,
    );
  });
