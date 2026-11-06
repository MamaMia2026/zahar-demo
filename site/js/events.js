export const WHATSAPP_NUMBER = "40700000000"; // număr de exemplu — înlocuiește cu numărul real (format internațional, fără +)

// Candy bar pentru evenimente: calcul + dialog „Rezervă data” → WhatsApp.
import { PZ, EVENT_TYPES, EVENT_RULES as R, lei } from "./data.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const ev = { t: "nunta", g: 120, p: 3 };

/** Calculul complet al ofertei. Exportat pentru teste. */
export function quote({ t, g, p } = ev) {
  const n = g * p, mix = EVENT_TYPES[t].mix;
  const cnt = mix.map(([, w]) => Math.round(n * w));
  cnt[0] += n - cnt.reduce((a, b) => a + b, 0);
  const base = mix.reduce((a, [i], k) => a + cnt[k] * PZ[i].price, 0);
  const disc = (R.discounts.find(([from]) => n >= from) || [0, 0])[1];
  const decor = g > R.decorFreeAboveGuests ? 0 : R.decorPrice;
  const total = base * (1 - disc) + decor;
  return { n, items: mix.map(([i], k) => ({ i, n: cnt[k] })), base, disc, decor, total };
}

function render() {
  ev.g = +$("#evG").value;
  $("#evGo").textContent = ev.g;
  const q = quote();
  $("#evN").textContent = q.n;
  $("#evMix").innerHTML = q.items.map(({ i, n }) => `<i style="width:${(n / q.n) * 100}%;background:${PZ[i].color}"></i>`).join("");
  $("#evLeg").innerHTML = q.items.map(({ i, n }) => `<span><i style="background:${PZ[i].color}"></i>${n} × ${PZ[i].name}</span>`).join("");
  $("#evR").innerHTML =
    `<div><span>Prăjituri</span><b>${lei(q.base)}</b></div>` +
    (q.disc ? `<div><span>Reducere volum (−${Math.round(q.disc * 100)}%)</span><b>−${lei(q.base * q.disc)}</b></div>` : "") +
    `<div><span>Decor & aranjare la locație</span><b>${q.decor ? lei(q.decor) : "inclus"}</b></div>`;
  $("#evTot").textContent = lei(q.total);
}

/* ---------- dialog rezervare ---------- */
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const roDate = (iso) => { const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; };

function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + R.minDaysAhead);
  return isoDate(d);
}

function summaryLines() {
  const q = quote();
  return {
    q,
    rows: [
      ["Eveniment", EVENT_TYPES[ev.t].label],
      ["Invitați", String(ev.g)],
      ["Prăjituri", `${q.n} buc. (${ev.p}/persoană)`],
      ["Mix", q.items.map(({ i, n }) => `${n} × ${PZ[i].name}`).join(", ")],
      ...(q.disc ? [["Reducere volum", `−${Math.round(q.disc * 100)}%`]] : []),
      ["Decor & aranjare", q.decor ? lei(q.decor) : "inclus"],
    ],
  };
}

function openDialog() {
  const dlg = $("#rez"), date = $("#rzDate");
  date.min = minDate();
  if (date.value && date.value < date.min) date.value = "";
  const { q, rows } = summaryLines();
  $("#rzSum").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  $("#rzTot").textContent = lei(q.total);
  $("#rzMinTxt").textContent = `cel mai devreme ${roDate(date.min)}`;
  dlg.showModal();
}

function submit(e) {
  e.preventDefault();
  const f = e.target, date = $("#rzDate");
  if (date.value && date.value < date.min) {
    date.setCustomValidity(`Alege o dată de la ${roDate(date.min)} încolo.`);
  } else date.setCustomValidity("");
  if (!f.reportValidity()) return;
  const { q, rows } = summaryLines();
  const msg = [
    "Bună! Aș vrea să rezerv un candy bar zahăr.",
    "",
    `Data: ${roDate(date.value)}`,
    `Locația: ${$("#rzLoc").value.trim()}`,
    `Nume: ${$("#rzName").value.trim()}`,
    `Telefon: ${$("#rzTel").value.trim()}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    `Total estimat: ${lei(q.total)}`,
  ].join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  $("#rez").close();
}

export function initEvents() {
  $("#evT").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]");
    if (!b) return;
    ev.t = b.dataset.t;
    $$("#evT button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    render();
  });
  $("#evP").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pp]");
    if (!b) return;
    ev.p = +b.dataset.pp;
    $$("#evP button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    render();
  });
  $("#evG").addEventListener("input", render);
  $("#evBtn").addEventListener("click", openDialog);
  $("#rzForm").addEventListener("submit", submit);
  $("#rzDate").addEventListener("input", (e) => e.target.setCustomValidity(""));
  $("#rzClose").addEventListener("click", () => $("#rez").close());
  $("#rez").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
  render();
}
