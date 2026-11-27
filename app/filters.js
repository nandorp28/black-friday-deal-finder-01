// Black Friday Radar — filtering, sorting and the URL hash.
//
// The whole filter state lives in the hash, so a filtered view is a
// link: #/?verdict=new-low, #/?q=airpods, #/deal/<id> for one deal.
// Changing a control rewrites the hash; the router re-renders.

import { CATEGORIES, STORES } from "./data.js";

export const SORTS = [
  { value: "saving", label: "Biggest saving ($)", text: "biggest saving" },
  { value: "discount", label: "Biggest discount (%)", text: "biggest discount" },
  { value: "price-asc", label: "Lowest price", text: "lowest price" },
  { value: "price-desc", label: "Highest price", text: "highest price" },
  { value: "name", label: "Name A–Z", text: "name A–Z" },
];

export const MIN_DISCOUNTS = [
  { value: 0, label: "Any" },
  { value: 25, label: "25%+" },
  { value: 40, label: "40%+" },
  { value: 50, label: "50%+" },
];

export const DEFAULT_STATE = Object.freeze({
  q: "",
  category: "all",
  store: "all",
  minDiscount: 0,
  sort: "saving",
  verdict: "all",
});

// One deal's numbers, rounded the way the board shows them.
export function savingOf(deal) {
  return Math.round((deal.was - deal.price) * 100) / 100;
}

export function percentOff(deal) {
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function money(amount) {
  const rounded = Math.round(amount * 100) / 100;
  return "$" + rounded.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function isDefaultState(state) {
  return (
    state.q === "" &&
    state.category === "all" &&
    state.store === "all" &&
    state.minDiscount === 0 &&
    state.sort === "saving" &&
    state.verdict === "all"
  );
}

// Read the filter state out of a hash like "#/?q=tv&verdict=new-low".
// Unknown values fall back to the defaults instead of breaking the page.
export function stateFromHash(hash) {
  const state = { ...DEFAULT_STATE };
  const queryIndex = (hash || "").indexOf("?");
  if (queryIndex < 0) return state;
  const params = new URLSearchParams((hash || "").slice(queryIndex + 1));
  const q = (params.get("q") || "").trim();
  if (q) state.q = q.slice(0, 80);
  const category = params.get("category") || "";
  if (CATEGORIES.includes(category)) state.category = category;
  const store = params.get("store") || "";
  if (STORES.includes(store)) state.store = store;
  const min = Number.parseInt(params.get("min") || "0", 10);
  if (MIN_DISCOUNTS.some((d) => d.value === min)) state.minDiscount = min;
  const sort = params.get("sort") || "";
  if (SORTS.some((s) => s.value === sort)) state.sort = sort;
  const verdict = params.get("verdict") || "";
  if (["new-low", "strong", "routine"].includes(verdict)) state.verdict = verdict;
  return state;
}

// Write the filter state back into a hash. Default values are left
// out so the plain board link stays short: "#/".
export function hashFromState(state) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category !== "all") params.set("category", state.category);
  if (state.store !== "all") params.set("store", state.store);
  if (state.minDiscount !== 0) params.set("min", String(state.minDiscount));
  if (state.sort !== "saving") params.set("sort", state.sort);
  if (state.verdict !== "all") params.set("verdict", state.verdict);
  const text = params.toString();
  return text ? "#/?" + text : "#/";
}

export function applyFilters(allDeals, state) {
  const needle = state.q.trim().toLowerCase();
  const kept = allDeals.filter((deal) => {
    if (needle) {
      const hay = (deal.title + " " + deal.store + " " + deal.category).toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (state.category !== "all" && deal.category !== state.category) return false;
    if (state.store !== "all" && deal.store !== state.store) return false;
    if (state.verdict !== "all" && deal.verdict !== state.verdict) return false;
    if (state.minDiscount > 0 && percentOff(deal) < state.minDiscount) return false;
    return true;
  });
  const sorted = [...kept];
  if (state.sort === "saving") sorted.sort((a, b) => savingOf(b) - savingOf(a));
  else if (state.sort === "discount") sorted.sort((a, b) => percentOff(b) - percentOff(a));
  else if (state.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (state.sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
  return sorted;
}

export function sortLabel(value) {
  return (SORTS.find((s) => s.value === value) || SORTS[0]).text;
}

// The three biggest savings on the board, for the hero.
export function topSavings(allDeals, count = 3) {
  return [...allDeals].sort((a, b) => savingOf(b) - savingOf(a)).slice(0, count);
}

export function boardTotals(allDeals) {
  const total = allDeals.reduce((sum, deal) => sum + savingOf(deal), 0);
  const newLows = allDeals.filter((deal) => deal.verdict === "new-low").length;
  const stores = [...new Set(allDeals.map((deal) => deal.store))];
  return { total, newLows, stores, count: allDeals.length };
}
