[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![make.fun rank](https://make.fun/badge/black-friday-deal-finder-01/nandorp28/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![make.fun reward](https://make.fun/badge/black-friday-deal-finder-01/nandorp28/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

# Black Friday Radar — 40 verified Black Friday deals, checked today

A Black Friday deal finder for the [make.fun bounty](https://make.fun/bounty/black-friday-deal-finder-01): a static site listing **40 real Black Friday / Cyber Monday deals**, each with its product, store, store link, sale price, usual price, discount, and the time it was checked — plus an honest verdict on whether it is really a deal.

## What it does

- **40 verified deals** across 10 categories and 3 stores (Amazon, Best Buy, Walmart), checked on **Fri 27 Nov 2026, 06:33–06:40 UTC** — Black Friday itself. Every deal names where its price was read.
- **Honest verdicts:** 11 NEW LOWs (lowest price ever), 26 STRONG deals, 3 ROUTINE sales — with the evidence for each, including the ones that are not worth chasing (a 13%-off Mac mini, a 15%-off Quest 3S, an AirTag 4-pack that costs more per tracker than the single).
- **Search and filters that work:** text search, category, store, minimum discount, sort (biggest saving / biggest discount / cheapest / new lows first), and verdict chips. Filter state lives in the URL (`#/?verdict=new-low`), so a filtered view has an address.
- **Same product, compared:** AirPods Pro 3 at Amazon ($149) vs Walmart ($149) vs Best Buy ($180); AirTag 2 single vs 4-pack per tracker.
- **A page per deal** (`#/deal/<id>`) with the full evidence, the sale window, and the store link.
- **Phone layout** that keeps the whole board usable at 390px wide.

Total savings across the board: over $6,400 off usual prices.

## How the prices were checked

Each deal was found and checked by the maker on Friday 27 November 2026 by reading the price in a deals roundup updated that morning that names the store (TrendThread Black Friday diary, NY Post live deals, USA Today, Mashable, Redmond Pie, BeeBulletin, Yahoo Shopping, Medium shortlist), cross-checking the headline prices against a second roundup. The check time and source sit on every deal. Prices move all day on Black Friday — the site tells shoppers to confirm at checkout.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

No build step, no network requests at run time: the deals are data in `app/data.js`, and every script, stylesheet and image is a file under `app/`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library. Screenshots are in `screenshots/` (see `shots.json` for what each one shows).

## License

MIT — see [LICENSE](LICENSE).
