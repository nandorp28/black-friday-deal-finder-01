// Black Friday Radar — the hash router.
//
// Routes: "#/" is the board (filters live in the query after "?"),
// "#/deal/<id>" is one deal's page. Controls rewrite the hash, and
// the hash change re-renders, so back/forward and shared links work.

import { deals } from "./data.js";
import { hashFromState, stateFromHash } from "./filters.js";
import { renderDeal, renderHome, renderNotFound } from "./views.js";

const app = document.getElementById("app");

function currentRoute() {
  const hash = window.location.hash || "#/";
  const dealMatch = hash.match(/^#\/deal\/([^/?#]+)/);
  if (dealMatch) return { page: "deal", id: decodeURIComponent(dealMatch[1]) };
  return { page: "home", state: stateFromHash(hash) };
}

function render() {
  // Typing in the search box rewrites the hash, which re-renders the
  // board and replaces the input — so remember the caret and put it
  // back, or the first keystroke would steal focus from the search.
  const active = document.activeElement;
  const refocusSearch = active !== null && active.id === "q";
  const caret = refocusSearch ? active.selectionStart || 0 : 0;
  const route = currentRoute();
  if (route.page === "deal") {
    const deal = deals.find((d) => d.id === route.id);
    app.innerHTML = deal ? renderDeal(deal) : renderNotFound(route.id);
    document.title = deal
      ? deal.title + " — Black Friday Radar"
      : "Deal not found — Black Friday Radar";
  } else {
    app.innerHTML = renderHome(route.state);
    document.title = "Black Friday Radar — 40 verified Black Friday deals";
    wireControls(route.state);
  }
  if (refocusSearch) {
    const search = document.getElementById("q");
    if (search) {
      search.focus();
      search.setSelectionRange(caret, caret);
    }
  }
  window.scrollTo(0, 0);
}

// The controls live inside the rendered board, so they are wired
// after every render. Each change writes the hash; the hashchange
// listener below does the re-render.
function wireControls(state) {
  const next = { ...state };
  const apply = () => {
    const wanted = hashFromState(next);
    if (window.location.hash !== wanted) {
      window.location.hash = wanted;
    } else {
      render();
    }
  };
  const search = document.getElementById("q");
  if (search) {
    search.addEventListener("input", () => {
      next.q = search.value;
      apply();
    });
  }
  for (const [id, key] of [
    ["category", "category"],
    ["store", "store"],
    ["min", "minDiscount"],
    ["sort", "sort"],
  ]) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener("change", () => {
      next[key] = key === "minDiscount" ? Number.parseInt(el.value, 10) : el.value;
      apply();
    });
  }
  for (const chip of document.querySelectorAll(".chip[data-verdict]")) {
    chip.addEventListener("click", () => {
      next.verdict = chip.getAttribute("data-verdict") || "all";
      apply();
    });
  }
}

window.addEventListener("hashchange", render);
render();
