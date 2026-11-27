[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/nandorp28/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/nandorp28/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

[![Black Friday Deal Finder](https://img.shields.io/badge/make.fun-Black%20Friday%20Deal%20Finder-red)](https://make.fun/bounty/black-friday-deal-finder-01)
[![40 verified deals](https://img.shields.io/badge/deals-40%20verified-green)](https://make.fun/bounty/black-friday-deal-finder-01)
[![MIT license](https://img.shields.io/badge/license-MIT-blue)](https://make.fun/bounty/black-friday-deal-finder-01)

# Black Friday Radar

A static deal finder for Black Friday and Cyber Monday 2026: **40 real deals**, each found and checked by the maker on Fri 27 Nov 2026, 06:40 UTC, with its product, store, store link, sale price, usual price, discount, check time, source — and an honest verdict on whether it is really a deal (11 NEW LOW, 26 STRONG DEAL, 3 ROUTINE SALE). Total savings across the board: **$6,535**.

The board leads with the three biggest savings (Hisense 98" QD5 TV, save $1,700; Samsung The Frame 65", save $403; Dyson V9 Motorbar, save $330), compares the same product across stores (AirPods Pro 3: Amazon $149 / Walmart $149 / Best Buy $180; AirTag 2 single $18 vs four-pack $80), and filters by search, category, store, minimum discount, sort order and verdict — with the filter state in the URL hash, so `#/?verdict=new-low` shows the 11 new lows.

## Run it

```sh
node serve.ts            # http://localhost:8080
node serve.ts --port 8081
```

No build step, no network requests: `app/` is plain HTML, CSS and ES modules.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts` (the kit's copy, unchanged).

## How the deals were checked

Every price was read on Black Friday morning, 27 Nov 2026, 06:33–06:40 UTC, in a deals roundup updated that morning that names the store, with headline prices cross-checked against a second roundup. Each deal page names where its price was read and when. Prices move all day on Black Friday, so the site tells shoppers to confirm at checkout.

## Layout

- `main.ts` — the hand-in program (Node 22, standard library only)
- `serve.ts` — the local static server
- `app/` — the site: `index.html`, `style.css`, `data.js` (the 40 deals), `filters.js` (search / filter / sort / hash state), `views.js` (board and deal pages), `main.js` (hash router)
- `screenshots/` — 4 renders of the site: cover, one deal page, the new-lows filter, phone size
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `shots.json` — what each screenshot shows

## License

MIT. See [LICENSE](LICENSE).
