// Filtering and sorting for the board. Every control on the page
// runs through here, so the list, the counts and the screenshots all
// agree about what "filtered" means.

import { deals } from "./data.js";

export const SORTS = {
  saving: { label: "Biggest saving ($)", run: (a, b) => b.was - b.price - (a.was - a.price) },
  percent: { label: "Biggest discount (%)", run: (a, b) => pct(b) - pct(a) },
  cheap: { label: "Cheapest first", run: (a, b) => a.price - b.price },
  newlow: {
    label: "New lows first",
    run: (a, b) => rank(a.verdict) - rank(b.verdict) || pct(b) - pct(a),
  },
};

export function pct(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function saving(d) {
  return Math.round((d.was - d.price) * 100) / 100;
}

function rank(v) {
  return v === "new-low" ? 0 : v === "strong" ? 1 : 2;
}

export function blankFilters() {
  return { q: "", category: "all", store: "all", verdict: "all", minPct: 0, sort: "saving" };
}

// Read the controls' state out of the hash query, so a filtered view
// has an address of its own: #/?verdict=new-low&sort=percent
export function filtersFromHash(hash) {
  const f = blankFilters();
  const query = hash.split("?")[1];
  if (!query) return f;
  for (const pair of query.split("&")) {
    const [key, value] = pair.split("=").map((s) => decodeURIComponent(s || ""));
    if (key === "q") f.q = value;
    if (key === "category") f.category = value;
    if (key === "store") f.store = value;
    if (key === "verdict") f.verdict = value;
    if (key === "minPct") f.minPct = Number(value) || 0;
    if (key === "sort" && SORTS[value]) f.sort = value;
  }
  return f;
}

export function filtersToHash(f) {
  const parts = [];
  if (f.q) parts.push(`q=${encodeURIComponent(f.q)}`);
  if (f.category !== "all") parts.push(`category=${encodeURIComponent(f.category)}`);
  if (f.store !== "all") parts.push(`store=${encodeURIComponent(f.store)}`);
  if (f.verdict !== "all") parts.push(`verdict=${encodeURIComponent(f.verdict)}`);
  if (f.minPct > 0) parts.push(`minPct=${f.minPct}`);
  if (f.sort !== "saving") parts.push(`sort=${encodeURIComponent(f.sort)}`);
  return parts.length ? `#/?${parts.join("&")}` : "#/";
}

export function applyFilters(f) {
  const q = f.q.trim().toLowerCase();
  const shown = deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (f.category !== "all" && d.category !== f.category) return false;
    if (f.store !== "all" && d.store !== f.store) return false;
    if (f.verdict !== "all" && d.verdict !== f.verdict) return false;
    if (pct(d) < f.minPct) return false;
    return true;
  });
  return [...shown].sort(SORTS[f.sort].run);
}

export function storeList() {
  return [...new Set(deals.map((d) => d.store))].sort();
}

export function totals(list) {
  const saved = list.reduce((sum, d) => sum + (d.was - d.price), 0);
  return {
    count: list.length,
    saved: Math.round(saved),
    newLows: list.filter((d) => d.verdict === "new-low").length,
  };
}
