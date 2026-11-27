// Black Friday Radar — the views: home board and deal pages.
// Everything renders from data.js through filters.js; no network.

import {
  CHECKED_SHORT,
  SALE_WINDOWS,
  VERDICTS,
  comparisons,
  deals,
} from "./data.js";
import {
  MIN_DISCOUNTS,
  SORTS,
  applyFilters,
  boardTotals,
  hashFromState,
  isDefaultState,
  money,
  percentOff,
  savingOf,
  sortLabel,
  topSavings,
} from "./filters.js";
import { CATEGORIES, STORES } from "./data.js";

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function verdictChip(deal) {
  const info = VERDICTS[deal.verdict];
  return (
    '<span class="verdict-chip ' +
    esc(deal.verdict) +
    '">' +
    esc(info.label) +
    "</span>"
  );
}

function priceRow(deal, big) {
  const cls = big ? "detail-price" : "deal-price";
  return (
    '<p class="' +
    cls +
    '"><span class="now">' +
    money(deal.price) +
    '</span><span class="was">' +
    money(deal.was) +
    '</span><span class="pct">' +
    percentOff(deal) +
    "% off</span></p>"
  );
}

function storeButton(deal) {
  return (
    '<a class="btn" href="' +
    esc(deal.url) +
    '" target="_blank" rel="noopener">View at ' +
    esc(deal.store) +
    " ↗</a>"
  );
}

function dealCard(deal) {
  const note = deal.note ? '<p class="deal-note">' + esc(deal.note) + "</p>" : "";
  return (
    '<article class="deal">' +
    '<p class="deal-top"><span class="cat">' +
    esc(deal.category) +
    '</span><span class="store">' +
    esc(deal.store) +
    "</span></p>" +
    '<h3><a href="#/deal/' +
    esc(deal.id) +
    '">' +
    esc(deal.title) +
    "</a></h3>" +
    priceRow(deal, false) +
    '<p class="save-line">You save ' +
    money(savingOf(deal)) +
    "</p>" +
    '<p class="verdict">' +
    verdictChip(deal) +
    '<span class="verdict-text">' +
    esc(deal.evidence) +
    "</span></p>" +
    '<p class="deal-source">Checked ' +
    CHECKED_SHORT +
    " · " +
    esc(deal.source) +
    "</p>" +
    '<p class="deal-actions">' +
    storeButton(deal) +
    '<a class="link-btn" href="#/deal/' +
    esc(deal.id) +
    '">Details</a></p>' +
    note +
    "</article>"
  );
}

function statsStrip() {
  const totals = boardTotals(deals);
  return (
    '<section class="stats" aria-label="Board totals">' +
    '<div class="stat"><b>' +
    totals.count +
    "</b><span>verified deals</span></div>" +
    '<div class="stat"><b>' +
    totals.newLows +
    "</b><span>new lows</span></div>" +
    '<div class="stat"><b>' +
    money(totals.total) +
    "</b><span>total savings</span></div>" +
    '<div class="stat"><b>' +
    totals.stores.length +
    " stores</b><span>" +
    totals.stores.map(esc).join(" · ") +
    "</span></div>" +
    '<div class="stat"><b>27 Nov</b><span>checked today, Fri 27 Nov 2026, 06:40 UTC</span></div>' +
    "</section>"
  );
}

function heroSection() {
  const top = topSavings(deals, 3);
  const ranks = ["#1 BIGGEST SAVING", "#2", "#3"];
  const cards = top
    .map(
      (deal, i) =>
        '<article class="hero-card">' +
        '<p class="hero-rank">' +
        ranks[i] +
        "</p>" +
        "<h3>" +
        esc(deal.title) +
        "</h3>" +
        '<p class="hero-meta">' +
        esc(deal.store) +
        " · " +
        esc(deal.category) +
        "</p>" +
        '<p class="hero-price"><span class="now">' +
        money(deal.price) +
        '</span><span class="was">' +
        money(deal.was) +
        '</span><span class="pct">' +
        percentOff(deal) +
        "% off</span></p>" +
        '<p class="hero-save">Save ' +
        money(savingOf(deal)) +
        " — " +
        esc(deal.evidence) +
        "</p>" +
        '<p class="hero-checked">Checked ' +
        CHECKED_SHORT +
        "</p>" +
        storeButton(deal) +
        "</article>",
    )
    .join("");
  return (
    '<h2 class="section-title">Top of the board — biggest savings today</h2>' +
    '<section class="hero">' +
    cards +
    "</section>"
  );
}

function compareSection() {
  const boxes = comparisons
    .map((table) => {
      const best = Math.min(...table.rows.map((row) => row.price));
      const rows = table.rows
        .map(
          (row) =>
            '<tr class="' +
            (row.price === best ? "best" : "") +
            '"><td>' +
            esc(row.store) +
            '</td><td class="price">' +
            money(row.price) +
            "</td><td>" +
            esc(row.note) +
            "</td></tr>",
        )
        .join("");
      return (
        '<div class="compare-box"><h3>' +
        esc(table.title) +
        "</h3>" +
        "<table><thead><tr><th>Store</th><th>Price</th><th>Read</th></tr></thead>" +
        "<tbody>" +
        rows +
        "</tbody></table>" +
        '<p class="compare-source">Source: ' +
        esc(table.source) +
        "</p></div>"
      );
    })
    .join("");
  return '<section class="compare">' + boxes + "</section>";
}

function selectOptions(options, current) {
  return options
    .map(
      (opt) =>
        '<option value="' +
        esc(opt.value) +
        '"' +
        (String(opt.value) === String(current) ? " selected" : "") +
        ">" +
        esc(opt.label) +
        "</option>",
    )
    .join("");
}

function controlsSection(state) {
  const categoryOpts = [{ value: "all", label: "All" }].concat(
    CATEGORIES.map((c) => ({ value: c, label: c })),
  );
  const storeOpts = [{ value: "all", label: "All" }].concat(
    STORES.map((s) => ({ value: s, label: s })),
  );
  const chips = ["all", "new-low", "strong", "routine"]
    .map((v) => {
      const label = v === "all" ? "All verdicts" : VERDICTS[v].label;
      return (
        '<button type="button" class="chip" data-verdict="' +
        v +
        '" aria-pressed="' +
        (state.verdict === v ? "true" : "false") +
        '">' +
        label +
        "</button>"
      );
    })
    .join("");
  return (
    '<section class="controls" aria-label="Search and filter">' +
    '<div class="controls-grid">' +
    '<div class="field"><label for="q">Search</label>' +
    '<input id="q" name="q" type="search" value="' +
    esc(state.q) +
    '" placeholder="Try &quot;AirPods&quot;, &quot;TV&quot;, &quot;Dyson&quot;…"></div>' +
    '<div class="field"><label for="category">Category</label>' +
    '<select id="category" name="category">' +
    selectOptions(categoryOpts, state.category) +
    "</select></div>" +
    '<div class="field"><label for="store">Store</label>' +
    '<select id="store" name="store">' +
    selectOptions(storeOpts, state.store) +
    "</select></div>" +
    '<div class="field"><label for="min">Min. discount</label>' +
    '<select id="min" name="min">' +
    selectOptions(MIN_DISCOUNTS, state.minDiscount) +
    "</select></div>" +
    '<div class="field"><label for="sort">Sort by</label>' +
    '<select id="sort" name="sort">' +
    selectOptions(SORTS, state.sort) +
    "</select></div>" +
    "</div>" +
    '<div class="verdict-row" role="group" aria-label="Verdict">' +
    chips +
    "</div>" +
    "</section>"
  );
}

export function renderHome(state) {
  const shown = applyFilters(deals, state);
  const plain = isDefaultState(state);
  let html = statsStrip();
  if (plain) html += heroSection() + compareSection();
  html += controlsSection(state);
  html +=
    '<p class="count-line">Showing <b>' +
    shown.length +
    "</b> of " +
    deals.length +
    " deals · sorted by " +
    esc(sortLabel(state.sort)) +
    "</p>";
  if (shown.length === 0) {
    html +=
      '<p class="empty">No deals match those filters. ' +
      '<a href="#/">Clear the filters</a> to see all ' +
      deals.length +
      " deals.</p>";
  } else {
    html +=
      '<section class="grid">' +
      shown.map(dealCard).join("") +
      "</section>";
  }
  return html;
}

function saleWindowFor(store) {
  const found = SALE_WINDOWS.find((w) => w.store === store);
  return found ? found.window : "Black Friday, 27 Nov 2026";
}

export function renderDeal(deal) {
  const same = deals
    .filter((d) => d.category === deal.category && d.id !== deal.id)
    .sort((a, b) => savingOf(b) - savingOf(a))
    .slice(0, 3);
  const note = deal.note ? '<p class="deal-note">' + esc(deal.note) + "</p>" : "";
  return (
    '<p><a class="back-link" href="#/">← All ' +
    deals.length +
    " deals</a></p>" +
    '<article class="detail">' +
    '<p class="detail-top"><span class="cat">' +
    esc(deal.category) +
    '</span><span class="store">' +
    esc(deal.store) +
    "</span></p>" +
    "<h1>" +
    esc(deal.title) +
    "</h1>" +
    priceRow(deal, true) +
    '<p class="save-line">You save ' +
    money(savingOf(deal)) +
    " off the usual price of " +
    money(deal.was) +
    ".</p>" +
    '<p class="verdict">' +
    verdictChip(deal) +
    '<span class="verdict-text">' +
    esc(deal.evidence) +
    "</span></p>" +
    '<p class="detail-blurb">' +
    esc(VERDICTS[deal.verdict].blurb) +
    "</p>" +
    '<table class="facts"><tbody>' +
    "<tr><th>Store</th><td>" +
    esc(deal.store) +
    "</td></tr>" +
    "<tr><th>Sale ends</th><td>" +
    esc(saleWindowFor(deal.store)) +
    "</td></tr>" +
    "<tr><th>Price checked</th><td>" +
    CHECKED_SHORT +
    "</td></tr>" +
    "<tr><th>Where it was read</th><td>" +
    esc(deal.source) +
    "</td></tr>" +
    "</tbody></table>" +
    '<p><a class="btn" href="' +
    esc(deal.url) +
    '" target="_blank" rel="noopener">View this deal at ' +
    esc(deal.store) +
    " ↗</a></p>" +
    note +
    '<p class="detail-note">Check the price at checkout — Black Friday prices move during the day.</p>' +
    "</article>" +
    '<h2 class="section-title">More in ' +
    esc(deal.category.toLowerCase()) +
    "</h2>" +
    '<section class="grid more-grid">' +
    same.map(dealCard).join("") +
    "</section>"
  );
}

export function renderNotFound(id) {
  return (
    '<p><a class="back-link" href="#/">← All ' +
    deals.length +
    " deals</a></p>" +
    '<p class="empty">No deal called “' +
    esc(id) +
    "” is on the board. " +
    '<a href="#/">See all ' +
    deals.length +
    " deals</a>.</p>"
  );
}

export { hashFromState };
