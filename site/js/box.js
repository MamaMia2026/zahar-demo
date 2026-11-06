// „Fă-ți cutia”: mărimi 6/12/24, prăjituri în/din cutie, drag & drop pe desktop, bară mobilă.
import { PZ, img, SIZES, CARD_PRICE, RIBBONS, lei, plural } from "./data.js";
import { addBox } from "./cart.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const mobile = matchMedia("(max-width: 760px)");

const state = { size: 1, box: [], ribbon: "rosu", card: false };
const cap = () => SIZES[state.size].n;
const isFull = () => state.box.length >= cap();

/** Prețul cutiei: suma prăjiturilor, minus reducerea mărimii, plus felicitarea. */
export function boxPrice(box = state.box, size = state.size, card = state.card) {
  const sum = box.reduce((a, i) => a + PZ[i].price, 0);
  return sum * (1 - SIZES[size].disc) + (card ? CARD_PRICE : 0);
}

let toast = () => {};

/* ---------- randare ---------- */
function renderSizes() {
  $("#sizes").innerHTML = SIZES.map((s, i) =>
    `<button type="button" class="${i === state.size ? "on" : ""}" data-sz="${i}" aria-pressed="${i === state.size}">
      <b>${s.n}</b><span>${s.label}</span></button>`).join("");
}

function buildPalette() {
  $("#pal").innerHTML = PZ.map((p, i) =>
    `<button type="button" class="pz" data-p="${i}" aria-label="Pune ${p.name} în cutie, ${p.price} lei">
      <img src="${img(i)}" alt="" width="${p.w}" height="${p.h}" loading="lazy" draggable="false">
      <em hidden></em><b>${p.name}</b><span>${p.price} lei</span></button>`).join("");
}

function updatePalette() {
  const full = isFull();
  $$("#pal .pz").forEach((b) => {
    const i = +b.dataset.p, n = state.box.filter((x) => x === i).length, em = $("em", b);
    b.disabled = full;
    em.hidden = !n;
    em.textContent = n;
    b.setAttribute("aria-label", `Pune ${PZ[i].name} în cutie, ${PZ[i].price} lei${n ? `, ${n} în cutie` : ""}`);
  });
}

function buildTray() {
  const c = cap();
  const tray = $("#tray");
  tray.style.gridTemplateColumns = `repeat(${c === 6 ? 3 : c === 12 ? 4 : 6},1fr)`;
  tray.dataset.n = c;
  tray.innerHTML = Array.from({ length: c }, (_, i) => `<button type="button" class="cell" data-cell="${i}"></button>`).join("");
}

function updateTray(newIdx = []) {
  $$("#tray .cell").forEach((cell, i) => {
    const p = state.box[i];
    if (p == null) {
      cell.className = "cell empty";
      cell.innerHTML = "";
      cell.disabled = true;
      cell.setAttribute("aria-label", `Loc liber ${i + 1}`);
      delete cell.dataset.rm;
    } else {
      const cur = cell.dataset.rm != null && $("img", cell)?.dataset.p == p;
      cell.className = "cell";
      cell.disabled = false;
      cell.dataset.rm = i;
      cell.setAttribute("aria-label", `Scoate ${PZ[p].name} din cutie (locul ${i + 1})`);
      if (!cur || newIdx.includes(i)) {
        cell.innerHTML = `<img src="${img(p)}" alt="" width="${PZ[p].w}" height="${PZ[p].h}" data-p="${p}" draggable="false">`;
      }
    }
  });
}

function updateSummary() {
  const c = cap(), n = state.box.length, left = c - n, price = boxPrice();
  $("#boxT").textContent = "Cutia de " + c;
  $("#boxC").textContent = `${n} / ${c}`;
  $("#bar").style.width = (n / c) * 100 + "%";
  $("#boxInfo").textContent = left ? `Mai pune ${left} ${plural(left, "prăjitură", "prăjituri")}` : "Cutia e plină ✓";
  $("#boxP").textContent = lei(price);
  const add = $("#addBox");
  add.disabled = !!left;
  add.title = left ? "Umple cutia ca să o poți adăuga" : "";
  // bara de jos pe mobil
  $("#mbT").textContent = `Cutia de ${c} · ${n}/${c} · ${lei(price)}`;
  $("#mbBtn").textContent = left ? "Vezi cutia" : "Adaugă →";
  $("#mbFill").style.width = (n / c) * 100 + "%";
  updateMobileBar();
}

function renderAll(newIdx) {
  updateTray(newIdx);
  updatePalette();
  updateSummary();
}

/* ---------- acțiuni ---------- */
function setSize(i) {
  state.size = i;
  state.box = state.box.slice(0, cap());
  renderSizes();
  buildTray();
  renderAll(state.box.map((_, k) => k));
}

function put(p, fromEl) {
  if (isFull()) return false;
  state.box.push(p);
  const idx = state.box.length - 1;
  renderAll([idx]);
  const cell = $(`#tray .cell[data-cell="${idx}"]`);
  animateIn(cell, fromEl);
  return true;
}

function removeAt(i) {
  state.box.splice(i, 1);
  renderAll(state.box.map((_, k) => k).filter((k) => k >= i));
  // păstrăm focusul într-un loc util dacă celula a devenit goală
  const cell = $(`#tray .cell[data-cell="${i}"]`);
  if (document.activeElement === document.body || cell?.disabled) {
    const prev = $$("#tray .cell:not(.empty)").pop();
    (prev || $("#pal .pz"))?.focus({ preventScroll: true });
  }
}

/** Prăjitura „sare” din paletă în celulă. */
function animateIn(cell, fromEl) {
  const im = cell && $("img", cell);
  if (!im) return;
  if (reduced.matches) return;
  if (!fromEl) { im.classList.add("jump"); return; }
  const a = fromEl.getBoundingClientRect(), b = cell.getBoundingClientRect();
  // dacă celula nu e vizibilă, doar un mic salt
  if (b.bottom < 0 || b.top > innerHeight) { im.classList.add("jump"); return; }
  const fly = document.createElement("img");
  fly.src = im.src; fly.alt = ""; fly.className = "fly";
  const size = Math.min(a.width, a.height);
  Object.assign(fly.style, { left: a.left + "px", top: a.top + "px", width: size + "px", height: size + "px" });
  document.body.appendChild(fly);
  im.style.opacity = "0";
  const dx = b.left + b.width / 2 - (a.left + size / 2), dy = b.top + b.height / 2 - (a.top + size / 2);
  const s = (b.width * 0.9) / size, lift = Math.min(-60, dy / 2 - 80);
  fly.animate([
    { transform: "translate(0,0) scale(1) rotate(0)" },
    { transform: `translate(${dx * 0.5}px,${lift}px) scale(${(1 + s) / 2}) rotate(-12deg)`, offset: 0.5 },
    { transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(0)` },
  ], { duration: 480, easing: "cubic-bezier(.45,.05,.4,1)" }).finished.finally(() => {
    fly.remove();
    im.style.opacity = "";
    im.classList.add("jump");
  });
}

/* ---------- drag & drop (doar mouse / desktop) ---------- */
function initDrag() {
  const boxEl = $(".box");
  let drag = null, suppressClick = false;

  $("#pal").addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".pz");
    if (!b || b.disabled || e.button !== 0 || e.pointerType !== "mouse" || !finePointer.matches) return;
    drag = { b, p: +b.dataset.p, x: e.clientX, y: e.clientY, ghost: null };
  });

  addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      const g = document.createElement("img");
      g.src = img(drag.p); g.alt = ""; g.className = "ghost";
      document.body.appendChild(g);
      drag.ghost = g;
      document.body.classList.add("dragging");
      drag.b.classList.add("src");
    }
    drag.ghost.style.transform = `translate(${e.clientX - 45}px,${e.clientY - 45}px) rotate(-8deg)`;
    const r = boxEl.getBoundingClientRect();
    drag.over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    boxEl.classList.toggle("drop", drag.over);
  });

  const end = (e, cancel) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    boxEl.classList.remove("drop");
    document.body.classList.remove("dragging");
    d.b.classList.remove("src");
    if (!d.ghost) return; // a fost click simplu
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 0);
    if (!cancel && d.over && put(d.p, d.ghost)) { d.ghost.remove(); return; }
    d.ghost.remove();
  };
  addEventListener("pointerup", (e) => end(e, false));
  addEventListener("pointercancel", (e) => end(e, true));
  addEventListener("keydown", (e) => { if (e.key === "Escape") end(e, true); });
  // click-ul generat după drag nu trebuie să mai adauge o dată
  $("#pal").addEventListener("click", (e) => { if (suppressClick) { e.stopImmediatePropagation(); suppressClick = false; } }, true);
}

/* ---------- bara de jos pe mobil ---------- */
const vis = { section: false, box: false };
function updateMobileBar() {
  const show = mobile.matches && vis.section && !vis.box && state.box.length > 0;
  const bar = $("#mbar");
  bar.classList.toggle("show", show);
  bar.inert = !show;
  document.body.classList.toggle("has-mbar", show);
}
function initMobileBar() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.target.id === "cutie") vis.section = en.isIntersecting;
      else vis.box = en.isIntersecting; // prețul cutiei e pe ecran → bara nu mai e necesară
    });
    updateMobileBar();
  }, { threshold: 0 });
  io.observe($("#cutie"));
  io.observe($("#boxP"));
  mobile.addEventListener("change", updateMobileBar);
  $("#mbBtn").addEventListener("click", () => {
    if (isFull()) addToCart();
    else $(".box").scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
  });
}

function addToCart() {
  if (!isFull()) return;
  addBox({
    size: cap(),
    items: state.box,
    ribbon: RIBBONS[state.ribbon],
    card: state.card,
    unit: Math.round(boxPrice()),
  });
  toast(`✓ Cutia de ${cap()} a fost adăugată în comandă`);
  state.box = [];
  renderAll();
}

export function initBox(opts) {
  toast = opts.toast;
  renderSizes();
  buildPalette();
  buildTray();
  state.box = [0, 1, 2, 3, 4, 5, 6, 7, 1, 2, 6]; // exemplu: 11 din 12, ca în machetă
  renderAll(state.box.map((_, i) => i));

  $("#sizes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sz]");
    if (b) setSize(+b.dataset.sz);
  });
  $("#pal").addEventListener("click", (e) => {
    const b = e.target.closest(".pz");
    if (b && !b.disabled) put(+b.dataset.p, $("img", b));
  });
  $("#tray").addEventListener("click", (e) => {
    const c = e.target.closest(".cell");
    if (c && c.dataset.rm != null) removeAt(+c.dataset.rm);
  });
  $("#ribbon").addEventListener("click", (e) => {
    const b = e.target.closest("[data-r]");
    if (!b) return;
    if (b.dataset.r === "card") {
      state.card = !state.card;
      b.classList.toggle("on", state.card);
      b.setAttribute("aria-pressed", state.card);
    } else {
      state.ribbon = b.dataset.r;
      $$("#ribbon [data-r]").forEach((x) => {
        if (x.dataset.r !== "card") { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); }
      });
    }
    updateSummary();
  });
  $("#rnd").addEventListener("click", () => {
    const start = state.box.length;
    while (!isFull()) state.box.push(Math.floor(Math.random() * PZ.length));
    const added = state.box.map((_, i) => i).filter((i) => i >= start);
    renderAll(added);
    if (!reduced.matches) added.forEach((i, k) => {
      const im = $(`#tray .cell[data-cell="${i}"] img`);
      if (im) { im.style.animationDelay = k * 35 + "ms"; im.classList.add("jump"); }
    });
  });
  $("#clr").addEventListener("click", () => { state.box = []; renderAll(); });
  $("#addBox").addEventListener("click", addToCart);

  initDrag();
  initMobileBar();
}
