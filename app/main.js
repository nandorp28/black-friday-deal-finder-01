// Boot and routing. Two routes, both on the hash so the whole site
// stays one static page:
//   #/            the board, with search and filters
//   #/deal/<id>  one deal, with its evidence and store link
// Filter state lives in the hash query (#/?verdict=new-low), so a
// filtered view has an address and the back button works. The page
// re-renders in place as the controls change, without reloading.

import { deals } from "./data.js";
import { applyFilters, blankFilters, filtersFromHash, filtersToHash } from "./filters.js";
import { dealCard, dealPage, listPage, missingPage } from "./views.js";

const app = document.getElementById("app");

function render() {
  window.__shotReady = false;
  const hash = location.hash || "#/";
  const dealMatch = hash.match(/^#\/deal\/([^/?]+)/);
  if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = found
      ? `${found.title} — ${found.price ? "$" + found.price : ""} at ${found.store} | Black Friday Radar`
      : "Deal not found | Black Friday Radar";
    app.innerHTML = found ? dealPage(found) : missingPage();
  } else {
    const f = filtersFromHash(hash);
    document.title = "Black Friday Radar — 40 verified Black Friday deals, checked today";
    app.innerHTML = listPage(f);
    wireControls(f);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function wireControls(f) {
  const read = () => ({
    ...f,
    q: document.getElementById("q").value,
    category: document.getElementById("category").value,
    store: document.getElementById("store").value,
    minPct: Number(document.getElementById("minPct").value),
    sort: document.getElementById("sort").value,
  });

  const refreshGrid = (next) => {
    const shown = applyFilters(next);
    const grid = document.querySelector(".grid");
    const count = document.getElementById("count");
    if (grid) grid.innerHTML = shown.map(dealCard).join("");
    if (count) count.innerHTML = `Showing <b>${shown.length}</b> of ${deals.length} deals`;
    const hero = document.querySelector(".hero");
    const compare = document.querySelector(".compare-wrap");
    const active =
      next.q !== "" ||
      next.category !== "all" ||
      next.store !== "all" ||
      next.verdict !== "all" ||
      next.minPct !== 0;
    if (hero) hero.style.display = active ? "none" : "";
    if (compare) compare.style.display = active ? "none" : "";
  };

  const commit = (next) => {
    history.replaceState(null, "", filtersToHash(next));
    refreshGrid(next);
  };

  const search = document.getElementById("q");
  if (search) search.addEventListener("input", () => commit(read()));
  for (const id of ["category", "store", "minPct", "sort"]) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => commit(read()));
  }
  for (const chip of document.querySelectorAll(".chip")) {
    chip.addEventListener("click", () => {
      const next = { ...read(), verdict: chip.dataset.verdict };
      for (const c of document.querySelectorAll(".chip")) {
        c.classList.toggle("on", c === chip);
      }
      commit(next);
    });
  }
}

window.addEventListener("hashchange", render);
render();
