// HTML for the board: the list page, the deal page, and the cards.
// Every value from the data is escaped before it reaches the page.
// Prices are shown as whole dollars except cents where the store
// charges them; the discount is always computed from the two prices,
// never typed in, so the numbers on a card always add up.

import { CHECKED_LABEL, VERDICTS, comparisons, deals, SALE_WINDOWS } from "./data.js";
import { applyFilters, filtersToHash, pct, saving, storeList, totals } from "./filters.js";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const usd = (n) =>
  Number.isInteger(n) ? `$${n.toLocaleString("en-US")}` : `$${n.toFixed(2)}`;

const checkedShort = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }) + " UTC"
  );
};

function verdictChip(d) {
  const v = VERDICTS[d.verdict];
  return `<span class="verdict verdict-${d.verdict}" title="${esc(v.blurb)}">${v.label}</span>`;
}

export function dealCard(d) {
  return `<article class="card">
  <div class="card-top"><span class="cat">${esc(d.category)}</span><span class="store">${esc(d.store)}</span></div>
  <h3><a href="#/deal/${esc(d.id)}">${esc(d.title)}</a></h3>
  <div class="prices"><span class="now">${usd(d.price)}</span><s class="was">${usd(d.was)}</s><span class="off">${pct(d)}% off</span></div>
  <div class="save">You save ${usd(saving(d))}</div>
  <div class="verdict-row">${verdictChip(d)}<span class="evidence">${esc(d.evidence)}</span></div>
  <div class="checked">Checked ${checkedShort(d.checked)} · ${esc(d.source.split(";")[0])}</div>
  <div class="card-actions"><a class="buy" href="${esc(d.url)}" target="_blank" rel="noopener">View at ${esc(d.store)} ↗</a><a class="details" href="#/deal/${esc(d.id)}">Details</a></div>
</article>`;
}

function heroCard(d, tag) {
  return `<article class="hero-card">
  <div class="hero-tag">${esc(tag)}</div>
  <h3><a href="#/deal/${esc(d.id)}">${esc(d.title)}</a></h3>
  <div class="hero-store">${esc(d.store)} · ${esc(d.category)}</div>
  <div class="prices"><span class="now">${usd(d.price)}</span><s class="was">${usd(d.was)}</s><span class="off">${pct(d)}% off</span></div>
  <div class="save">Save ${usd(saving(d))} — ${esc(d.evidence)}</div>
  <div class="checked">Checked ${checkedShort(d.checked)}</div>
  <a class="buy" href="${esc(d.url)}" target="_blank" rel="noopener">View at ${esc(d.store)} ↗</a>
</article>`;
}

function comparePanel(c) {
  const rows = c.rows
    .map(
      (r, i) =>
        `<tr class="${i === 0 ? "best" : ""}"><td>${esc(r.store)}</td><td class="num">${usd(r.price)}</td><td>${esc(r.note)}</td></tr>`,
    )
    .join("");
  return `<section class="compare"><h2>${esc(c.title)}</h2><table><thead><tr><th>Store</th><th>Price</th><th>Read</th></tr></thead><tbody>${rows}</tbody></table><p class="src">Source: ${esc(c.source)}</p></section>`;
}

function statsStrip(t) {
  return `<section class="stats" aria-label="Board totals">
  <div class="stat"><b>${t.count}</b><span>verified deals</span></div>
  <div class="stat"><b>${t.newLows}</b><span>new lows</span></div>
  <div class="stat"><b>$${t.saved.toLocaleString("en-US")}</b><span>total savings</span></div>
  <div class="stat"><b>${storeList().length} stores</b><span>Amazon · Best Buy · Walmart</span></div>
  <div class="stat"><b>27 Nov</b><span>checked today, ${CHECKED_LABEL}</span></div>
</section>`;
}

function controls(f) {
  const cats = ["all", ...new Set(deals.map((d) => d.category))];
  const stores = ["all", ...storeList()];
  const opt = (list, current) =>
    list
      .map(
        (v) =>
          `<option value="${esc(v)}" ${v === current ? "selected" : ""}>${v === "all" ? "All" : esc(v)}</option>`,
      )
      .join("");
  const chips = ["all", "new-low", "strong", "routine"]
    .map(
      (v) =>
        `<button type="button" data-verdict="${v}" class="chip ${f.verdict === v ? "on" : ""}">${v === "all" ? "All verdicts" : VERDICTS[v].label}</button>`,
    )
    .join("");
  return `<section class="controls" id="controls">
  <label class="search">Search <input id="q" type="search" placeholder="Try “AirPods”, “TV”, “Dyson”…" value="${esc(f.q)}"></label>
  <label>Category <select id="category">${opt(cats, f.category)}</select></label>
  <label>Store <select id="store">${opt(stores, f.store)}</select></label>
  <label>Min. discount <select id="minPct">
    ${[0, 25, 40, 50].map((n) => `<option value="${n}" ${f.minPct === n ? "selected" : ""}>${n === 0 ? "Any" : n + "% or more"}</option>`).join("")}
  </select></label>
  <label>Sort by <select id="sort">
    <option value="saving" ${f.sort === "saving" ? "selected" : ""}>Biggest saving ($)</option>
    <option value="percent" ${f.sort === "percent" ? "selected" : ""}>Biggest discount (%)</option>
    <option value="cheap" ${f.sort === "cheap" ? "selected" : ""}>Cheapest first</option>
    <option value="newlow" ${f.sort === "newlow" ? "selected" : ""}>New lows first</option>
  </select></label>
  <div class="chips">${chips}</div>
</section>`;
}

export function listPage(f) {
  const shown = applyFilters(f);
  const t = totals(deals);
  const top = [...deals].sort((a, b) => b.was - b.price - (a.was - a.price)).slice(0, 3);
  const hero =
    f.q === "" && f.category === "all" && f.store === "all" && f.verdict === "all" && f.minPct === 0
      ? `<section class="hero"><h2>Top of the board — biggest savings today</h2><div class="hero-grid">${heroCard(top[0], "#1 BIGGEST SAVING")}${heroCard(top[1], "#2")}${heroCard(top[2], "#3")}</div></section>
  <section class="compare-wrap">${comparisons.map(comparePanel).join("")}</section>`
      : "";
  const cards = shown.map(dealCard).join("");
  const empty =
    shown.length === 0
      ? `<p class="empty">No deal matches those filters. <a href="#/">Clear the filters</a> to see all ${deals.length} deals.</p>`
      : "";
  return `${statsStrip(t)}${hero}${controls(f)}
<p class="count" id="count">Showing <b>${shown.length}</b> of ${deals.length} deals${f.sort ? ` · sorted by ${esc(documentSortLabel(f.sort))}` : ""}</p>
<div class="grid">${cards}</div>${empty}
<section class="windows"><h2>Sale windows</h2><ul>${SALE_WINDOWS.map((w) => `<li><b>${esc(w.store)}</b> — ${esc(w.window)}</li>`).join("")}</ul>
<p>Cyber Monday is Monday 30 Nov. Prices move all day on Black Friday — always confirm the price at checkout before you buy.</p></section>`;
}

function documentSortLabel(sort) {
  return { saving: "biggest saving", percent: "biggest discount", cheap: "cheapest first", newlow: "new lows first" }[sort];
}

export function dealPage(d) {
  const siblings = deals
    .filter((x) => x.category === d.category && x.id !== d.id)
    .slice(0, 3);
  return `<p class="back"><a href="#/">&larr; All ${deals.length} deals</a></p>
<article class="detail">
  <div class="card-top"><span class="cat">${esc(d.category)}</span><span class="store">${esc(d.store)}</span></div>
  <h1>${esc(d.title)}</h1>
  <div class="prices big"><span class="now">${usd(d.price)}</span><s class="was">${usd(d.was)}</s><span class="off">${pct(d)}% off</span></div>
  <p class="save big-save">You save ${usd(saving(d))} off the usual price of ${usd(d.was)}.</p>
  <div class="verdict-row big">${verdictChip(d)}<span class="evidence">${esc(d.evidence)}</span></div>
  <p class="verdict-why">${esc(VERDICTS[d.verdict].blurb)}</p>
  ${d.note ? `<p class="note"><b>Condition:</b> ${esc(d.note)}</p>` : ""}
  <dl class="facts">
    <dt>Store</dt><dd>${esc(d.store)}</dd>
    <dt>Sale ends</dt><dd>${esc((SALE_WINDOWS.find((w) => w.store === d.store) || {}).window || "Black Friday weekend")}</dd>
    <dt>Price checked</dt><dd>${checkedShort(d.checked)}</dd>
    <dt>Where it was read</dt><dd>${esc(d.source)}</dd>
  </dl>
  <a class="buy big-buy" href="${esc(d.url)}" target="_blank" rel="noopener">View this deal at ${esc(d.store)} ↗</a>
  <p class="checkout-note">Check the price at checkout — Black Friday prices move during the day.</p>
</article>
${siblings.length ? `<section class="siblings"><h2>More in ${esc(d.category)}</h2><div class="grid">${siblings.map(dealCard).join("")}</div></section>` : ""}`;
}

export function missingPage() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all ${deals.length} deals</a>.</p>`;
}

export function currentHash(f) {
  return filtersToHash(f);
}
