// Date demo: prăjituri, mărimi de cutie, mixuri pentru evenimente. Prețuri de exemplu.

/** Prăjiturile. Indexul din listă e folosit ca ID în cutie și în mixuri. */
export const PZ = [
  { id: "eclair",        name: "Éclair ciocolată", desc: "Cremă de ciocolată 64%, glazură lucioasă", price: 14, color: "#5A3324", w: 236, h: 236 },
  { id: "macaron",       name: "Macaron zmeură",   desc: "Ganache de zmeură, zmeură proaspătă",       price: 12, color: "#E7819A", w: 207, h: 207 },
  { id: "choux-fistic",  name: "Choux fistic",     desc: "Cremă diplomat de fistic sicilian",         price: 13, color: "#A9B86A", w: 216, h: 216 },
  { id: "tarta-lamaie",  name: "Tartă lămâie",     desc: "Curd de lămâie, bezea, mentă",              price: 13, color: "#F2D25C", w: 223, h: 223 },
  { id: "cheesecake",    name: "Mini cheesecake",  desc: "Brânză cremoasă, căpșuni",                  price: 14, color: "#D23B48", w: 217, h: 217 },
  { id: "tarta-caramel", name: "Tartă caramel",    desc: "Caramel sărat, ciocolată neagră",           price: 15, color: "#9A5B2E", w: 217, h: 217 },
  { id: "dom-visine",    name: "Dom vișine",       desc: "Mousse de ciocolată albă, vișine",          price: 15, color: "#B01E3A", w: 221, h: 221 },
  { id: "paris-brest",   name: "Paris-Brest",      desc: "Praliné de alune, migdale",                 price: 15, color: "#C99A64", w: 225, h: 225 },
];

export const img = (i) => `img/${PZ[i].id}.webp`;

/** Mărimi de cutie: [bucăți, subtitlu, reducere]. */
export const SIZES = [
  { n: 6,  label: "pentru doi",           disc: 0 },
  { n: 12, label: "pentru familie",       disc: 0 },
  { n: 24, label: "pentru birou · −15%",  disc: 0.15 },
];

export const CARD_PRICE = 5;

export const RIBBONS = { rosu: "Fundă roșie", crem: "Fundă crem" };

/** Candy bar: mix pe tip de eveniment — [index prăjitură, pondere]. */
export const EVENT_TYPES = {
  nunta:      { label: "Nuntă",      mix: [[6, .25], [1, .2], [7, .2], [2, .2], [3, .15]] },
  botez:      { label: "Botez",      mix: [[1, .3], [4, .25], [3, .2], [2, .25]] },
  corporate:  { label: "Corporate",  mix: [[0, .25], [2, .2], [5, .2], [3, .2], [7, .15]] },
  aniversare: { label: "Aniversare", mix: [[0, .25], [4, .25], [1, .25], [5, .25]] },
};

export const EVENT_RULES = {
  minGuests: 20, maxGuests: 300,
  perPerson: [2, 3, 4],
  discounts: [[300, .12], [150, .08]], // de la N bucăți
  decorPrice: 250, decorFreeAboveGuests: 150, // decor inclus peste 150 invitați
  minDaysAhead: 5,
};

export const DELIVERY = { price: 19, freeFrom: 200 };

/** 4590 → „4.590 lei” */
export const lei = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " lei";

export const plural = (n, one, many) => (n === 1 ? one : many);
