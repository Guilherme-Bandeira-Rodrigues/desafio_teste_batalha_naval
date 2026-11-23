"use strict";
const FROTA = Object.freeze({
  portaAvioes: 5,
  encouracado: 4,
  submarino: 3,
  destroier: 2,
});
function coordenada(l, c) {
  if (![l, c].every((x) => Number.isInteger(x) && x >= 0 && x < 10))
    throw new RangeError("Coordenada inválida");
}
class Tabuleiro {
  constructor() {
    this.casas = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.navios = new Map();
    this.tiros = new Set();
  }
  posicionar(tipo, l, c, direcao) {
    if (
      !Object.hasOwn(FROTA, tipo) ||
      this.navios.has(tipo) ||
      !["H", "V"].includes(direcao)
    )
      throw new Error("Navio ou direção inválida");
    const pos = Array.from({ length: FROTA[tipo] }, (_, i) => [
      l + (direcao === "V" ? i : 0),
      c + (direcao === "H" ? i : 0),
    ]);
    for (const [a, b] of pos) {
      coordenada(a, b);
      if (this.casas[a][b]) throw new Error("Sobreposição");
    }
    for (const [a, b] of pos) this.casas[a][b] = tipo;
    this.navios.set(tipo, pos);
  }
  pronto() {
    return this.navios.size === 4;
  }
  posicionarAleatoriamente(rng = Math.random) {
    if (this.navios.size || this.tiros.size)
      throw new Error("Tabuleiro deve estar vazio");
    if (typeof rng !== "function") throw new TypeError("rng deve ser função");
    const temporario = new Tabuleiro();
    const tipos = Object.keys(FROTA);
    function buscar(indice) {
      if (indice === tipos.length) return true;
      const tipo = tipos[indice],
        tamanho = FROTA[tipo],
        opcoes = [];
      for (let l = 0; l < 10; l++)
        for (let c = 0; c < 10; c++)
          for (const d of ["H", "V"])
            if (d === "H" ? c + tamanho <= 10 : l + tamanho <= 10)
              opcoes.push([l, c, d]);
      for (let i = opcoes.length - 1; i > 0; i--) {
        const n = rng();
        if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n >= 1)
          throw new RangeError("rng inválido");
        const j = Math.floor(n * (i + 1));
        [opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]];
      }
      for (const [l, c, d] of opcoes) {
        const casas = Array.from({ length: tamanho }, (_, i) => [
          l + (d === "V" ? i : 0),
          c + (d === "H" ? i : 0),
        ]);
        if (casas.some(([a, b]) => temporario.casas[a][b])) continue;
        temporario.posicionar(tipo, l, c, d);
        if (buscar(indice + 1)) return true;
        for (const [a, b] of casas) temporario.casas[a][b] = null;
        temporario.navios.delete(tipo);
      }
      return false;
    }
    if (!buscar(0)) throw new Error("Frota não pôde ser posicionada");
    this.casas = temporario.casas;
    this.navios = temporario.navios;
  }
  tiro(l, c) {
    coordenada(l, c);
    const chave = `${l},${c}`;
    if (this.tiros.has(chave)) throw new Error("Tiro repetido");
    this.tiros.add(chave);
    const tipo = this.casas[l][c];
    if (!tipo) return { resultado: "agua" };
    const afundou = this.navios
      .get(tipo)
      .every(([a, b]) => this.tiros.has(`${a},${b}`));
    return { resultado: afundou ? "afundou" : "acerto", navio: tipo };
  }
  derrotado() {
    return (
      this.pronto() &&
      [...this.navios.values()].every((pos) =>
        pos.every(([l, c]) => this.tiros.has(`${l},${c}`)),
      )
    );
  }
  visao(revelar = false) {
    return this.casas.map((linha, l) =>
      linha.map((n, c) =>
        this.tiros.has(`${l},${c}`)
          ? n
            ? "X"
            : "O"
          : revelar && n
            ? "N"
            : "~",
      ),
    );
  }
}
class Partida {
  constructor(a, b) {
    if (
      !(a instanceof Tabuleiro) ||
      !(b instanceof Tabuleiro) ||
      a === b ||
      !a.pronto() ||
      !b.pronto()
    )
      throw new Error("Duas frotas completas são necessárias");
    this.tabuleiros = [a, b];
    this.vez = 0;
    this.vencedor = null;
  }
  atirar(j, l, c) {
    if (this.vencedor !== null || j !== this.vez)
      throw new Error("Turno inválido");
    const alvo = this.tabuleiros[1 - j],
      resultado = alvo.tiro(l, c);
    if (alvo.derrotado()) this.vencedor = j;
    else this.vez = 1 - j;
    return resultado;
  }
}
module.exports = { FROTA, Tabuleiro, Partida };
