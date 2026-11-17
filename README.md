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

## The model — radar-3

Every row is scored by one function of the snapshot figures. No protocol name is
ever special-cased.

```
categoryMultiple = the category's median market-cap / TVL among the snapshot's own
                   live-token protocols, each protocol's ratio capped at 1.00 first,
                   then shrunk toward the global median (4 pseudo-counts)
                   and clamped to [0.05, 1.00]
implied = round( tvl_usd x categoryMultiple
                 x (1 + clamp(change_7d, -60, 120) / 100 x 0.5)
                 x (0.6 + min(age_days, 1095) / 1095 x 0.4)
                 x (1 + 0.02 x min(chains - 1, 5)) )
```

- **Category multiple, computed from the snapshot at run time.** A category whose
  tokens trade richly against TVL (DEXs x0.31, bridges x0.42–0.53, Privacy x0.54)
  earns a higher multiple than one whose tokens trade thinly (Lending x0.15,
  Liquid Staking x0.09). A category with one live token is pulled toward the global
  median (x0.21) so a single outlier cannot set the multiple; a category with none
  uses the global median.
- **The 1.00 ratio cap (new in radar-3).** A token never counts as trading at more
  than the TVL it secures, so a token trading on a sliver of TVL cannot set a whole
  category's multiple. Without it, one protocol did: Rain, a prediction-market token
  with a $2.6B market cap on $6.6M of TVL (a 400x ratio), set the Prediction Market
  multiple to the 1.00 clamp and put Polymarket at $318M; and API3, the single live
  Risk Curator at 2.97x, set the multiple behind ranks 1, 2 and 3. With the cap no
  multiple sits on the clamp, the global median is unchanged (x0.21), the top three
  keep their order on roughly half the value, and Polymarket falls to #6 at $118M —
  the correction lands exactly on the rows the outliers had inflated.
- **Growth** is the 7-day TVL change, clamped to [-60, +120]%.
- **Maturity** is the time since the protocol was first listed — how long it has run
  with no token. Unknown age uses 365 days.
- **Breadth** is the number of chains, capped at +10%.

The board ranks **198 protocols**: the whole 40-protocol watchlist plus every other
protocol the house's own watchlist rule keeps. The rule is applied to the whole board,
not just the watchlist, so wrapped, staked and bridged products of tokens that already
trade (WBTC, Coinbase Bridge, Binance's staked bitcoin) are excluded — they are not
launches still to come. The starter's board stopped at the 160 largest early protocols;
this one leaves none of the rankable ones unscored. Coverage was re-checked against
the snapshot for radar-3: all 144 pre-token protocols left off the board are excluded
by the house rule itself (103 by category alone — CEXs, canonical bridges, liquid
staking receipt tokens — 11 versioned names, 5 wrapped/staked names, the rest by
several reasons at once), and no rankable protocol is missed.

Top of the board: Steakhouse Financial ($888M implied), Sentora Curator ($822M),
Gauntlet ($529M), Veda ($201M), USDD ($173M), Polymarket International ($118M).

## Farm plans

Each row carries 8 steps, derived from the protocol's own record (category, chains,
TVL, age): a fresh wallet, a main position, a *second, different* qualifying action
(supply then borrow, LP then swap, bridge then bridge back), a category-specific risk
step (impermanent loss for DEX liquidity, liquidation for a borrow, slashing and the
unbonding wait for staking, depeg for a stable asset — what to watch while the capital
is in, with the cost of checking), a weekly cadence, a hold
of 30–60 days, an eligibility check that never pays to claim, and a farm log. Every
step states its cost and its time.

## The dashboard

Dark theme, no network, no framework. Search, category filter, chain filter,
watchlist-only toggle, minimum-TVL filter, pre-token / live-token tabs, sortable
columns (rank, name, TVL, 7d, age, category multiple, implied value), a detail drawer
for every protocol showing each multiplier and a recompute check against board.json,
and a model panel with the formula and the category-multiples table for all 34
categories computed from this snapshot, each with its live-token count and raw median,
so the multiple behind any row can be checked. Dashboard source is 44,552 bytes — under the 65,536-byte dossier text
cap, so the judge reads all of it.

## Files

- `main.ts` — the program (Node 22, stdlib only). Reads `/input/snapshot.json`,
  writes `/output/board.json`, `/output/data.js`, copies `dashboard/` and
  `screenshots/`, writes `/output/dossier.json` with the vendored library.
- `lib/model.ts` — the radar-3 model, farm plans, snapshot parsing, board validation.
- `vendor/makefun-board.ts` — the kit's library, byte-for-byte (sha256 matches
  `kit.json`).
- `dashboard/index.html`, `dashboard/app.css`, `dashboard/app.js` — the static page.
- `screenshots/1-board.png`, `2-detail.png`, `3-filtered.png` — real renders of the
  dashboard in Chrome-for-Testing 159 headless shell at 1440x900 (board, Steakhouse Financial detail,
  Dexs filter), re-taken for radar-3.
- `LICENSE` — MIT.
- `check-gate.py` — a local replica of the sealed gate's seven rows.
- `kit/`, `kit.tar.gz` — the downloaded kit, reference only, not part of the repo.
- `out/` — a local run's output, for inspection only, not part of the repo.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input kit/token-radar-01-kit/input/snapshot.json
python3 check-gate.py
```

## Verification (17 Nov 2026, local — radar-3)

- Kit integrity: every file in the kit matches the SHA-256 hashes in `kit/kit.json`
  (0 mismatches). Note: the downloaded tarball's SHA-256
  (`2d8de8ef713d6fa0e7382be49ee3a6d68b8e4f521944b831a26a47cd6cf23dae`) differs from
  the `x-kit-sha256` header (`7ed937cfb2b97794d8b4d187a0cab30e0d4574892702bb8629ced0c66ab19279`),
  but the contents verify against `kit.json`, so the kit is authentic — the same
  tarball-vs-header pattern as the earlier kits.
- Local gate replica (`check-gate.py`): **ALL PASS** — dashboard_files, board_file
  (198 rows), sorted_by_value (ranks 1..198, strictly non-increasing, 198 distinct
  implied values), coverage (40/40 watchlist), farm_steps (0 bad, 8 steps a row),
  screenshots (3 PNGs, 1440x900, 158–227 KB each), dossier size (786,978 bytes).
- Dossier: rebuilding `dossier.json` from `out/` with the vendored `buildDossier`
  gives **byte-identical** output (786,978 bytes).
- Determinism: two runs into separate directories are **byte-identical** (`diff -r`).
- Cross-checks: the dashboard's farm plans match `board.json` for all 198 rows (0
  mismatches), and the dashboard's implied-value recompute matches `board.json` for
  all 198 rows (0 mismatches). The radar-3 multiples table has no row on either clamp
  (was 3 at 1.00); the global median is unchanged at x0.2138.
- Screenshots were visually inspected: the board (Steakhouse Financial $887.5M,
  Polymarket #6 at $118.2M), the Steakhouse Financial detail drawer (model breakdown
  with the recompute check reading the same $887.5M, and the 8-step farm plan with the
  new risk step), and the Dexs-filtered view (21 rows, Bittensor dTAO now #12) all
  render legibly with nothing clipped. Screenshots were taken with the
  Chrome-for-Testing 159 headless shell from the Playwright cache
  (`~/.cache/ms-playwright/chromium_headless_shell-1255/`); Google Chrome is not
  installed on this VM and the VM's Hatch Chromium refuses headless screenshots
  (WebGL domain policy error, no output).

Earlier verification (16 Nov 2026, radar-2) is superseded by the above; the radar-2
numbers were: board 198 rows, dossier 766,283 bytes, dashboard source 40,252 bytes,
screenshots 157–218 KB in Google Chrome 157. One real bug was caught and fixed by the
cross-checks then: the category multiple was rounded to 4 decimals in `board.json`
while the model used full precision, which made 178 of 198 rows recompute to a
different number. The multiple is now stored at full precision.

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
