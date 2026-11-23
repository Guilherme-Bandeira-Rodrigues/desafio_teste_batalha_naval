const { test } = require("node:test");
const a = require("node:assert/strict");
const { FROTA, Tabuleiro, Partida } = require("../src/batalha");
function frota() {
  const t = new Tabuleiro();
  Object.keys(FROTA).forEach((n, i) => t.posicionar(n, i, 0, "H"));
  return t;
}
test("frota ocupa 14 casas e não permite sobreposição ou saída", () => {
  const t = frota();
  a.equal(t.pronto(), true);
  a.equal(
    t
      .visao(true)
      .flat()
      .filter((x) => x === "N").length,
    14,
  );
  const x = new Tabuleiro();
  x.posicionar("destroier", 0, 0, "H");
  a.throws(() => x.posicionar("submarino", 0, 1, "V"));
  a.throws(() => x.posicionar("submarino", 9, 9, "H"), RangeError);
  a.equal(x.casas[1][1], null);
});
test("tiros identificam água, acerto e navio afundado; repetição é inválida", () => {
  const t = frota();
  a.deepEqual(t.tiro(9, 9), { resultado: "agua" });
  a.equal(t.tiro(3, 0).resultado, "acerto");
  a.equal(t.tiro(3, 1).resultado, "afundou");
  a.throws(() => t.tiro(3, 1));
  a.equal(t.visao()[3][0], "X");
});
test("turnos, tiros inválidos e vitória ao afundar frota", () => {
  const p = new Partida(frota(), frota());
  a.throws(() => p.atirar(1, 0, 0));
  a.throws(() => p.atirar(0, 10, 0), RangeError);
  a.equal(p.vez, 0);
  const alvos = Object.values(FROTA).flatMap((n, l) =>
    Array.from({ length: n }, (_, c) => [l, c]),
  );
  alvos.forEach(([l, c], i) => {
    p.atirar(0, l, c);
    if (i < 13) p.atirar(1, 8 + Math.floor(i / 10), i % 10);
  });
  a.equal(p.vencedor, 0);
  a.throws(() => p.atirar(1, 9, 9));
});
test("rejeita frotas incompletas e repetição não altera turno", () => {
  a.throws(() => new Partida(frota(), new Tabuleiro()));
  const p = new Partida(frota(), frota());
  p.atirar(0, 0, 0);
  p.atirar(1, 0, 0);
  a.throws(() => p.atirar(0, 0, 0));
  a.equal(p.vez, 0);
});
