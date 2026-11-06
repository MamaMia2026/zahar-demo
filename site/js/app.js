// Punct de intrare: bestsellers, toast, inițializare module.
import { PZ, img } from "./data.js";
import { initCart, addPiece, onChange } from "./cart.js";
import { initBox } from "./box.js";
import { initEvents } from "./events.js";

const $ = (s) => document.querySelector(s);

let tt;
function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove("show"), 2200);
}

function renderBest() {
  const tags = ["Nou", "Bestseller"];
  $("#bst").innerHTML = [6, 0, 2, 5].map((i, k) => {
    const p = PZ[i];
    return `<article class="bc">${tags[k] ? `<span class="tg">${tags[k]}</span>` : ""}
      <img src="${img(i)}" alt="${p.name}" width="${p.w}" height="${p.h}" loading="lazy">
      <h3>${p.name}</h3><p>${p.desc}</p>
      <div class="f"><b>${p.price} lei</b><button type="button" class="add" data-bp="${i}" aria-label="Adaugă ${p.name} în comandă, ${p.price} lei">+</button></div></article>`;
  }).join("");
  $("#bst").addEventListener("click", (e) => {
    const b = e.target.closest("[data-bp]");
    if (!b) return;
    addPiece(+b.dataset.bp);
    toast(`✓ ${PZ[+b.dataset.bp].name} adăugat în comandă`);
  });
}

initCart({ toast });
onChange(() => {
  const b = $("#bag");
  b.classList.remove("bump");
  void b.offsetWidth; // repornește animația
  b.classList.add("bump");
});
initBox({ toast });
initEvents();
renderBest();
