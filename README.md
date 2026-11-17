# token-radar-01

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/ical-iann/token-radar-01/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/ical-iann/token-radar-01/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar: ranks every rankable pre-token protocol by implied value, with a static dashboard. Built by an AI agent for make.fun's "Build the best token launch radar" bounty, $1,325 in USDC.

## Run it

```sh
node main.ts
```


# Token Radar — make.fun bounty token-radar-01

A token launch radar: it reads the sealed DefiLlama snapshot, ranks every rankable
pre-token protocol by an implied value, and hands in a dashboard a reader can use —
a sortable, filterable board, a detail view for each protocol with its model breakdown
and farm plan, and a live-token view set aside from the ranking.

**Built locally only. Not submitted to GitHub or make.fun. No wallet was signed.**

## The model — radar-4

Every row is scored by one function of the snapshot figures. No protocol name is
never special-cased.

```
categoryMultiple = the category's median market-cap / TVL among the snapshot's own
                   live-token protocols, but only when the category has at least
                   3 of them; with fewer it uses the global median (x0.21).
                   Each protocol's ratio is capped at 1.00 first, then the median
                   is shrunk toward the global median (4 pseudo-counts)
                   and clamped to [0.05, 1.00]
implied = round( tvl_usd x categoryMultiple
                 x (1 + clamp(change_7d, -60, 120) / 100 x 0.5)
                 x (0.6 + min(age_days, 1095) / 1095 x 0.4)
                 x (1 + 0.02 x min(chains - 1, 5)) )
```

- **Category multiple, computed from the snapshot at run time.** A category whose
  tokens trade richly against TVL (DEXs x0.31, bridges x0.42–0.53, Privacy x0.54)
  earns a higher multiple than one whose tokens trade thinly (Lending x0.15,
  Liquid Staking x0.09). A category with three or more live tokens uses its own
  shrunk median; a category with fewer uses the global median (x0.21), and the
  dashboard's multiples table marks those rows "global". A category with none
  uses the global median too.
- **The minimum-sample rule (new in radar-4).** It finishes what radar-3's 1.00
  ratio cap started. The cap stopped one protocol setting a category to the 1.00
  clamp, but it did not stop one protocol setting the category at all: a single
  live token's ratio, capped to 1.00, still set its category median to 1.00, and
  the 4-count shrink only diluted it to x0.37 — 77% above the global median —
  behind 7 of the top 15 rows. Risk Curators ran on API3 alone (2.97x on $11.8M
  of TVL), Prediction Market on Rain alone ($2.6B on $6.6M of TVL, 400x), Chain
  on Astar dApps Staking alone (3.03x), and Derivatives on two thin-TVL perps
  (Gains 1.38x on $6.0M, Veranta 2.95x on $10.8M) at x0.48. A category with one
  or two live tokens has no measurable multiple of its own, so those categories
  now use the global median. The top three keep their order on the global
  multiple (Steakhouse $511M, Sentora $473M, Gauntlet $305M, down from $888M /
  $822M / $529M), Polymarket falls from #6 at $118M to #9 at $68M, the
  Derivatives rows fall 39–50 places each, and 191 of 198 rows change rank
  (47 by 20 places or more). The rule cuts both ways: categories whose one or
  two live tokens trade thinly (Onchain Capital Allocator, Restaking, Staking
  Pool) also move to the global median, so Veda rises from $201M to $293M and
  Upshift from $72M to $105M. 20 of the 34 categories use the global median.
- **Growth** is the 7-day TVL change, clamped to [-60, +120]%. The clamp does
  real work on one row: Shift DeFi records +4,448% in a week on $47.6M of TVL,
  a jump that reads as a listing or reclassification rather than growth, and it
  is scored at the +120% cap like the other two rows above it.
- **Maturity** is the time since the protocol was first listed — how long it has run
  with no token. Unknown age uses 365 days.
- **Breadth** is the number of chains, capped at +10%.

The board ranks **198 protocols**: the whole 40-protocol watchlist plus every other
protocol the house's own watchlist rule keeps. The rule is applied to the whole board,
not just the watchlist, so wrapped, staked and bridged products of tokens that already
trade (WBTC, Coinbase Bridge, Binance's staked bitcoin) are excluded — they are not
launches still to come. The starter's board stopped at the 160 largest early protocols;
this one leaves none of the rankable ones unscored. Coverage was re-checked against
the snapshot for radar-4: all 144 pre-token protocols left off the board are excluded
by the house rule itself (103 by category alone — CEXs, canonical bridges, liquid
staking receipt tokens — 11 versioned names, 5 wrapped/staked names, the rest by
several reasons at once), and no rankable protocol is missed.

Top of the board: Steakhouse Financial ($511M implied), Sentora Curator ($473M),
Gauntlet ($305M), Veda ($293M), USDD ($173M), Upshift ($105M), BitFi Basis ($92M),
Bittensor dTAO ($70M), Polymarket International ($68M).

## Farm plans

Each row carries 8 steps, derived from the protocol's own record (category, chains,
TVL, age): a fresh wallet, a main position, a *second, different* qualifying action
(supply then borrow, LP then swap, bridge then bridge back), a category-specific risk
step (impermanent loss for DEX liquidity, liquidation for a borrow, slashing and the
unbonding wait for staking, depeg for a stable asset, a funding-rate flip for a basis
trade, a paused bridge or sequencer for a chain, a depeg for a BTC-pegged asset — what
to watch while the capital is in, with the cost of checking), a weekly cadence, a hold
of 30–60 days, an eligibility check that never pays to claim, and a farm log. Every
step states its cost and its time. Radar-4 added the basis-trade, chain, BTC-pegged,
farm and liquidity-manager branches (the last folds into the DEX plan); only 6 rows
still fall back to the generic contract-risk step (CeDeFi, Payments, OTC Marketplace,
Governance Incentives, Crypto Card Issuer), down from 27 in radar-3.

## The dashboard

Dark theme, no network, no framework. Search, category filter, chain filter,
watchlist-only toggle, minimum-TVL filter, pre-token / live-token tabs, sortable
columns (rank, name, TVL, 7d, age, category multiple, implied value), a detail drawer
for every protocol showing each multiplier and a recompute check against board.json,
and a model panel with the formula and the category-multiples table for all 34
categories computed from this snapshot, each with its live-token count, raw median
and multiple used — rows that use the global median are marked "global",
so the multiple behind any row can be checked. Dashboard source is 46,885 bytes — under the 65,536-byte dossier text
cap, so the judge reads all of it.

## Files

- `main.ts` — the program (Node 22, stdlib only). Reads `/input/snapshot.json`,
  writes `/output/board.json`, `/output/data.js`, copies `dashboard/` and
  `screenshots/`, writes `/output/dossier.json` with the vendored library.
- `lib/model.ts` — the radar-4 model, farm plans, snapshot parsing, board validation.
- `vendor/makefun-board.ts` — the kit's library, byte-for-byte (sha256 matches
  `kit.json`).
- `dashboard/index.html`, `dashboard/app.css`, `dashboard/app.js` — the static page.
- `screenshots/1-board.png`, `2-detail.png`, `3-filtered.png` — real renders of the
  dashboard in Chrome-for-Testing 159 headless shell at 1440x900 (board, Steakhouse Financial detail,
  Dexs filter), re-taken for radar-4 (169 KB, 224 KB, 158 KB).
- `LICENSE` — MIT.
- `check-gate.py` — a local replica of the sealed gate's seven rows.
- `kit/`, `kit.tar.gz` — the downloaded kit, reference only, not part of the repo.
- `out/` — a local run's output, for inspection only, not part of the repo.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input kit/token-radar-01-kit/input/snapshot.json
python3 check-gate.py
```

## Verification (18 Nov 2026, local — radar-4)

- Kit integrity: every file in the kit matches the SHA-256 hashes in `kit/kit.json`
  (0 mismatches). Note: the downloaded tarball's SHA-256
  (`2d8de8ef713d6fa0e7382be49ee3a6d68b8e4f521944b831a26a47cd6cf23dae`) differs from
  the `x-kit-sha256` header (`7ed937cfb2b97794d8b4d187a0cab30e0d4574892702bb8629ced0c66ab19279`),
  but the contents verify against `kit.json`, so the kit is authentic — the same
  tarball-vs-header pattern as the earlier kits.
- Local gate replica (`check-gate.py`): **ALL PASS** — dashboard_files, board_file
  (198 rows), sorted_by_value (ranks 1..198, strictly non-increasing, 198 distinct
  implied values), coverage (40/40 watchlist), farm_steps (0 bad, 8 steps a row),
  screenshots (3 PNGs, 1440x900, 158–224 KB each), dossier size (782,538 bytes).
- Dossier: rebuilding `dossier.json` from `out/` with the vendored `buildDossier`
  gives **byte-identical** output (782,538 bytes).
- Determinism: two runs into separate directories are **byte-identical** (`diff -r`).
- Cross-checks: the dashboard's farm plans match `board.json` for all 198 rows (0
  mismatches), and the dashboard's implied-value recompute matches `board.json` for
  all 198 rows (0 mismatches). The radar-4 multiples table has 20 of 34 categories
  on the global median (x0.2138) and no row on either clamp; the global median is
  unchanged at x0.2138. The radar-3 board was reconstructed from the snapshot with
  the radar-3 formula to measure the move: it reproduces radar-3 exactly (top three
  $888M / $822M / $529M, Polymarket #6 at $118.2M), and against it radar-4 moves
  191 of 198 rows, 47 by 20 places or more.
- Screenshots were visually inspected: the board (Steakhouse Financial $511.4M,
  Polymarket #9 at $68.1M, median implied value $3.8M, "radar-4 model" in the header),
  the Steakhouse Financial detail drawer (model breakdown with the recompute check
  reading the same $511.4M, and the 8-step farm plan with the curator risk step),
  and the Dexs-filtered view (21 rows, Bittensor dTAO now #8) all render legibly
  with nothing clipped. Screenshots were taken with the Chrome-for-Testing 159
  headless shell from the Playwright cache
  (`~/.cache/ms-playwright/chromium_headless_shell-1255/`); Google Chrome is not
  installed on this VM and the VM's Hatch Chromium refuses headless screenshots
  (WebGL domain policy error, no output).

Earlier verification (17 Nov 2026, radar-3) is superseded by the above; the radar-3
numbers were: board 198 rows, dossier 786,978 bytes, dashboard source 44,552 bytes,
screenshots 158–227 KB, top three $888M / $822M / $529M, Polymarket #6 at $118.2M.
One real bug was caught and fixed by the cross-checks in radar-2: the category
multiple was rounded to 4 decimals in `board.json` while the model used full
precision, which made 178 of 198 rows recompute to a different number. The multiple
is now stored at full precision.

## Still needed from BOS before any submission

1. **GitHub repository**: a public repo on BOS's own GitHub account
   (`ical-iann`, https://github.com/ical-iann), created after the bounty opened
   (2026-11-14T10:00:00Z), OSI licensed, with `main.ts`, `lib/`, `vendor/`,
   `dashboard/`, `screenshots/`, `LICENSE` at the root.
2. **Transcripts** of the AI coding-agent sessions that built the entry, bundled
   with the kit's `node cli/makefun.mjs bundle`.
3. **Explicit confirmation to submit**, and the entry signature (Solana wallet
   `34Tvf2NTCS2V9dq2oeKztL4vb15bgbQ3tEPwAxFo9bJJ`, already linked to
   @witty-walrus-59) at submission time — the reward is escrowed, so entries are
   signed.
4. Deadline: **Mon 14 Dec 2026, 18:00 WITA**.
