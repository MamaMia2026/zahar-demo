// Coșul: cutii + bucăți separate, salvat în localStorage.
import { PZ, img, DELIVERY, CARD_PRICE, lei } from "./data.js";

const KEY = "zahar-cos-v1";
const $ = (s, r = document) => r.querySelector(s);

/** linie: {key, type:"box", size, items:[idx], ribbon, card, unit, qty} | {key, type:"piece", p, unit, qty} */
let lines = load();
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter(valid) : [];
  } catch {
    return [];
  }
}
function valid(l) {
  if (!l || typeof l.key !== "string" || !(l.qty >= 1)) return false;
  if (l.type === "piece") return PZ[l.p] != null;
  if (l.type === "box") return Array.isArray(l.items) && l.items.every((i) => PZ[i] != null) && l.unit > 0;
  return false;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* storage indisponibil — coșul rămâne doar în pagină */ }
}
function changed() {
  save();
  render();
  listeners.forEach((fn) => fn());
}

export const onChange = (fn) => listeners.add(fn);
export const count = () => lines.reduce((a, l) => a + l.qty, 0);
export const subtotal = () => lines.reduce((a, l) => a + l.unit * l.qty, 0);
export const delivery = (sub = subtotal()) => (sub === 0 || sub >= DELIVERY.freeFrom ? 0 : DELIVERY.price);
export const total = () => subtotal() + delivery();
export const getLines = () => lines.map((l) => ({ ...l }));

export function addBox({ size, items, ribbon, card, unit }) {
  lines.push({ key: "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: "box", size, items: [...items], ribbon, card, unit, qty: 1 });
  changed();
}
export function addPiece(p) {
  const ex = lines.find((l) => l.type === "piece" && l.p === p);
  if (ex) ex.qty++;
  else lines.push({ key: "p" + p, type: "piece", p, unit: PZ[p].price, qty: 1 });
  changed();
}
export function setQty(key, qty) {
  const l = lines.find((x) => x.key === key);
  if (!l) return;
  if (qty <= 0) lines = lines.filter((x) => x !== l);
  else l.qty = Math.min(qty, 99);
  changed();
}
export function clear() {
  lines = [];
  changed();
}

/* ---------- UI ---------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function boxContents(items) {
  const counts = new Map();
  items.forEach((i) => counts.set(i, (counts.get(i) || 0) + 1));
  return [...counts].map(([i, n]) => `${n}× ${PZ[i].name}`).join(", ");
}

function lineHTML(l) {
  const qty = `<div class="qty" role="group" aria-label="Cantitate">
      <button type="button" data-q="${l.key}" data-d="-1" aria-label="Scade cantitatea">−</button>
      <output aria-live="polite">${l.qty}</output>
      <button type="button" data-q="${l.key}" data-d="1" aria-label="Crește cantitatea">+</button></div>`;
  if (l.type === "piece") {
    const p = PZ[l.p];
    return `<li class="cl"><img src="${img(l.p)}" alt="" width="56" height="56" loading="lazy">
      <div class="cl-t"><b>${esc(p.name)}</b><span>La bucată · ${lei(l.unit)}</span></div>
      <div class="cl-r">${qty}<b>${lei(l.unit * l.qty)}</b></div></li>`;
  }
  const extras = [l.ribbon, l.card ? `felicitare (+${CARD_PRICE} lei)` : ""].filter(Boolean).join(" · ");
  const thumbs = l.items.slice(0, 6).map((i) => `<img src="${img(i)}" alt="" width="22" height="22" loading="lazy">`).join("");
  return `<li class="cl cl-box"><div class="cl-ic" aria-hidden="true">${thumbs}</div>
    <div class="cl-t"><b>Cutia de ${l.size}${l.size === 24 ? " <em>−15%</em>" : ""}</b><span>${esc(extras)}</span>
      <details><summary>Ce conține</summary><p>${esc(boxContents(l.items))}</p></details></div>
    <div class="cl-r">${qty}<b>${lei(l.unit * l.qty)}</b></div></li>`;
}

function render() {
  const n = count();
  $("#bagN").textContent = n;
  $("#bag").setAttribute("aria-label", `Comanda ta, ${n} ${n === 1 ? "produs" : "produse"}`);
  const list = $("#cartList");
  if (!list) return;
  const empty = lines.length === 0;
  $("#cartEmpty").hidden = !empty;
  $("#cartFoot").hidden = empty;
  list.innerHTML = lines.map(lineHTML).join("");
  const sub = subtotal(), del = delivery(sub);
  $("#cartSub").textContent = lei(sub);
  $("#cartDel").textContent = del ? lei(del) : "gratuit";
  $("#cartTot").textContent = lei(sub + del);
  const left = DELIVERY.freeFrom - sub;
  $("#cartHint").textContent = left > 0 ? `Mai adaugă ${lei(left)} pentru livrare gratuită.` : "Livrarea e gratuită ✓";
  $("#cartHintBar").style.width = Math.min(100, (sub / DELIVERY.freeFrom) * 100) + "%";
}

export function initCart({ toast }) {
  const dlg = $("#cart"), co = $("#checkout");
  $("#bag").addEventListener("click", () => { dlg.showModal(); });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) return dlg.close(); // click pe fundal
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.q) {
      const l = lines.find((x) => x.key === b.dataset.q);
      if (l) setQty(l.key, l.qty + Number(b.dataset.d));
    }
  });
  $("#cartClose").addEventListener("click", () => dlg.close());
  $("#cartShop").addEventListener("click", () => dlg.close());
  $("#cartPlace").addEventListener("click", () => {
    $("#coTot").textContent = lei(total());
    $("#coN").textContent = `${count()} ${count() === 1 ? "produs" : "produse"}`;
    dlg.close();
    co.showModal();
  });
  co.addEventListener("click", (e) => { if (e.target === co) co.close(); });
  $("#coClose").addEventListener("click", () => co.close());
  $("#coClear").addEventListener("click", () => { clear(); co.close(); toast("Coșul a fost golit"); });
  render();
}
