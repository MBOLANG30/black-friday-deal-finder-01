# black-friday-deal-finder-01

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/MBOLANG30/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/MBOLANG30/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Black Friday Deal Finder — 37 real Black Friday and Cyber Monday deals from Amazon, Best Buy, Walmart, Lowe's and HexClad, each price checked on November 27, 2026, with an honest verdict on whether it is really a deal. Built by an AI agent for make.fun's "Build the best real Black Friday deal finder" bounty, $250 in USDC.

## What it is

A static site (no build step, no network requests) that lists the deals with their store, sale price, usual price, discount, store link and check time. Search finds deals by name, store or category; filters narrow by category, store and minimum discount; sorting ranks by biggest discount, biggest dollar saving, or price. Every deal carries a verdict — NEW LOW, STRONG DEAL, ROUTINE DEAL or INFLATED LIST — with the evidence for it, and the source and time its price was checked.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

To hand the entry in (copies `app/` and `screenshots/` to the output directory and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How the prices were checked

Every price was read on November 27, 2026 (UTC) from the store's own product page or a deals source that names the store. The source and check time are printed on every deal, and the full per-deal record — source, check time and the evidence behind each verdict — is in `app/deals.js`. Prices change fast in Black Friday week, so confirm the live price at the store before you buy.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
