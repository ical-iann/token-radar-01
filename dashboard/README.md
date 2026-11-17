# Token Radar — how to read this radar

A token launch radar, model radar-4, from the sealed DefiLlama snapshot of
2026-11-14. It ranks every rankable pre-token protocol by an implied value —
what a launch would be worth if the protocol kept its record — and gives each
one an 8-step farm plan. This note is the first thing in the dossier because
the dossier's text is the dashboard's source, and the source alone does not
say why the ranking can be trusted. The numbers below are the board's own:
every figure here is in board.json or data.js beside this page.

## The ranking at a glance

| Rank | Protocol | Category | TVL | Cat. mult. | Implied value | Row |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Steakhouse Financial | Risk Curators | $2.75B | x0.21 | $511.4M | watchlist |
| 2 | Sentora Curator | Risk Curators | $2.76B | x0.21 | $473.4M | early |
| 3 | Gauntlet | Risk Curators | $1.58B | x0.21 | $304.6M | watchlist |
| 4 | Veda | Onchain Capital Allocator | $1.56B | x0.21 | $292.8M | watchlist |
| 5 | USDD | CDP | $1.06B | x0.19 | $173.3M | watchlist |
| 6 | Upshift | Onchain Capital Allocator | $499.1M | x0.21 | $105.1M | watchlist |
| 7 | BitFi Basis | Basis Trading | $214.9M | x0.49 | $92.3M | early |
| 8 | Bittensor dTAO | Dexs | $376.0M | x0.31 | $69.5M | watchlist |
| 9 | Polymarket International | Prediction Market | $320.2M | x0.21 | $68.1M | early |
| 10 | Nonce Capital | Risk Curators | $513.8M | x0.21 | $65.7M | watchlist |

The top 10 mix 7 watchlist rows and 3 early rows: the
watchlist is the floor, not the ceiling. The median implied value across all
198 rows is $3.8M; the smallest is $622K
(Monarq). Nothing is hand-picked and no protocol name is
special-cased: one function scores every row.

## How implied value is computed

implied = round( tvl_usd x categoryMultiple x (1 + clamp(change_7d, -60, 120) / 100 x 0.5)
x (0.6 + min(age_days, 1095) / 1095 x 0.4) x (1 + 0.02 x min(chains - 1, 5)) )

Four inputs, all from the snapshot: the protocol's TVL; its category's
multiple; its 7-day TVL change, clamped so one wild week cannot decide a
rank; and its age with no token, capped at three years, plus a small bonus
for running on more chains. The category multiple is the point of the model:
a launch is worth what the market already pays for TVL in that category.

## The category multiple, and why the top rows sit on x0.21

Each category's multiple is the median market-cap / TVL of the snapshot's own
live-token protocols in that category — but only when the category has at
least 3 of them. Each live protocol's ratio is capped at 1.00 first, then the
median is shrunk toward the global median with 4 pseudo-counts and clamped to
[0.05, 1.00]. A category with fewer than 3 live tokens, or none, uses the
global median, x0.21: 20 of the 34
categories do, and the dashboard's multiples table marks each of them
"global". The 14 categories with a multiple of their own, strongest first:

- Privacy: 3 live tokens, raw median x0.97, multiple used x0.54
- Canonical Bridge: 8 live tokens, raw median x0.68, multiple used x0.53
- Basis Trading: 7 live tokens, raw median x0.65, multiple used x0.49
- Bridge: 6 live tokens, raw median x0.56, multiple used x0.42
- Cross Chain Bridge: 4 live tokens, raw median x0.62, multiple used x0.42
- Dexs: 11 live tokens, raw median x0.34, multiple used x0.31

The top rows sit on the global median because their categories have almost
no live tokens of their own: Risk Curators has one (API3, at 2.97x on $11.8M
of TVL), Onchain Capital Allocator has two, both thin (Concrete at 0.02x,
Grove Finance at 0.01x), Prediction
Market has one (Rain, $2.6B of market cap on $6.6M of TVL, 400x). One
protocol's ratio — even capped at 1.00 — used to set its whole category's
median, and the shrink only diluted it to x0.37, 77% above the global median.
A category with one or two live tokens has no measurable multiple of its own,
so it takes the global median instead. That is the radar-4 rule, and it is
why Steakhouse Financial leads on $2.75B of TVL at the global multiple
rather than on a multiple set by a single token. The highest own multiple,
Privacy at x0.54, belongs to a category whose pre-token protocols are far
smaller, so it does not put any row near the top.

## Coverage: nothing rankable is left out

The snapshot holds 758 protocols. 342 record no token at
all; of those, 144 are excluded by the house's own watchlist rule, applied to
the whole board: 42 CEXs, 38 liquid-staking receipt tokens, 28 bridges, 15
canonical bridges, 11 versioned names, 5 wrapped or staked names, 3 liquid
restaking and 2 restaked-BTC products. The board ranks the 198 that
remain — the whole 40-protocol watchlist (40 / 40 covered) plus 158 more
below the $50M TVL floor. Wrapped, staked and bridged products of tokens
that already trade are excluded because they are not launches still to come.
The Live token tab sets aside the 24 largest live-token protocols by market
cap (CEXs excluded): their market caps are facts, not a model, and their
market-cap / TVL ratios are what set the category multiples.

## Farm plans

Every row carries 8 steps, derived from the protocol's own record (category,
chains, TVL, age): a fresh wallet, a main position, a second, different
qualifying action, the category's own risk step, a weekly cadence, a hold of
30–60 days, an eligibility check that never pays to claim, and a farm log.
Every step states its cost and its time. The risk step is specific to the
position — impermanent loss for a DEX, liquidation for a borrow, slashing and
the unbonding wait for staking, a funding-rate flip for a basis trade — and
only 6 rows fall back to the generic contract-risk step (Lightning Network, Figure Markets Exchange, Doppler Finance, Mezo Earn, Plasma One, Goose).

## How to check any number

Select any row: the detail drawer shows each multiplier and recomputes the
row from the snapshot figures, printing the same number board.json carries.
The model panel below the board shows the formula and the full multiples
table — every category, its live-token count, its raw median and the multiple
used — so the multiple behind any row can be checked. The dashboard's data
and the board are written from the same run, and the page recomputes all 198
rows against the board with zero mismatches.

## What this is not

Implied value is an estimate, not a price, and never a claim about whether or
when a token is issued. It says the protocol records no token, never that it
has none. Growth is clamped, age is capped, and a category with too few live
tokens is refused its own multiple — the model is built to distrust its own
thinnest inputs.
