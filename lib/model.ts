// Token Radar's model, version radar-4: one snapshot of the protocol universe in, one ranked
// board out.
//
// The board covers EVERY rankable pre-token protocol in the snapshot: the whole 40-protocol
// watchlist (the floor, never a ceiling) plus every other protocol the house's own watchlist
// rule keeps — 198 rows in this snapshot. The starter's board stopped at the 160 largest early
// protocols; this one leaves none of the rankable ones unscored, because the radar exists to
// find early launches, and the early ones are the small ones.
//
// Implied value follows only from the snapshot's own figures. No protocol name is ever
// special-cased; the same function scores every row:
//
//   categoryMultiple = the category's median market-cap / TVL among the snapshot's own
//                      live-token protocols, but only when the category has at least
//                      MIN_LIVE_COUNT (3) of them; with fewer, the category uses the
//                      global median. Each live protocol's ratio is capped at 1.0 first,
//                      then the median is shrunk toward the global median (4 pseudo-counts)
//                      and clamped to [0.05, 1.00]
//   base       = tvl_usd x categoryMultiple
//   growth     = clamp(change_7d, -60, 120) per cent
//   growthMult = 1 + (growth / 100) x GROWTH_WEIGHT
//   maturity   = 0.6 + min(age_days, 1095) / 1095 x 0.4   (age_days unknown: 365)
//   breadth    = 1 + 0.02 x min(chains - 1, 5)            (more chains, more reach, at most 1.10)
//   implied    = max(1, round(base x growthMult x maturity x breadth))
//
// The minimum-sample rule is new in radar-4, and it finishes what radar-3's ratio cap
// started. The cap stopped one protocol setting a category to the 1.00 clamp, but it did
// not stop one protocol setting the category at all: a single live token's ratio, capped
// to 1.00, still set the category median to 1.00, and the 4-count shrink only diluted it
// to 0.37 — 77% above the global median of 0.21. Seven of the top fifteen rows carried
// that multiple: Risk Curators on API3 alone (2.97x on $11.8M of TVL, capped to 1.00),
// Prediction Market on Rain alone ($2.6B on $6.6M of TVL, 400x), Chain on Astar dApps
// Staking alone (3.03x), and Derivatives on two thin-TVL perps (Gains 1.38x on $6.0M,
// Veranta 2.95x on $10.8M) at 0.48. A category with one or two live tokens has no
// measurable multiple of its own — one token, however richly it trades, cannot set it —
// so those categories now use the global median, the honest prior. The top three keep
// their order on the global multiple (Steakhouse $511M, Sentora $473M, Gauntlet $305M),
// Polymarket falls from #6 at $118M to #9 at $68M, and the correction lands exactly on
// the rows the thin-TVL tokens had inflated. The rule cuts both ways: categories whose
// one or two live tokens trade thinly (Onchain Capital Allocator, Restaking, Staking
// Pool) also move to the global median, so Veda rises from $201M to $293M. Categories
// with three or more live tokens keep their own shrunk median (DEXs x0.31, Lending
// x0.15, Liquid Staking x0.09, Privacy x0.54).
//
// The dashboard recomputes a row from the same figures and checks the number board.json
// carries, so the page's code and the board's data are visibly the same arithmetic.

/** The snapshot's protocol entry: exactly the ten fields the sealed input carries. */
export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** The whole snapshot document. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** The model's constants, as the dashboard states them. */
export interface ModelConstants {
  growth_weight: number;
  growth_floor: number;
  growth_cap: number;
  maturity_floor: number;
  maturity_range: number;
  maturity_days: number;
  unknown_age_days: number;
  shrink_count: number;
  min_live_count: number;
  multiple_floor: number;
  multiple_cap: number;
  ratio_cap: number;
  breadth_per_chain: number;
  breadth_max_chains: number;
}

export const MODEL: ModelConstants = {
  growth_weight: 0.5,
  growth_floor: -60,
  growth_cap: 120,
  maturity_floor: 0.6,
  maturity_range: 0.4,
  maturity_days: 1095,
  unknown_age_days: 365,
  shrink_count: 4,
  min_live_count: 3,
  multiple_floor: 0.05,
  multiple_cap: 1.0,
  ratio_cap: 1.0,
  breadth_per_chain: 0.02,
  breadth_max_chains: 5,
};

/** The model's version label: the dashboard names it. */
export const MODEL_VERSION = 'radar-4';

/** How many live-token protocols the Live token view carries, by market cap. */
export const LIVE_ROWS = 24;

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** One row of board.json: the ranked board's row. */
export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
  token_status: 'pre-token';
  age_days: number | null;
  implied_value_usd: number;
  model: {
    category_multiple: number;
    growth_pct: number;
    growth_multiplier: number;
    maturity_multiplier: number;
    breadth_multiplier: number;
    age_days: number | null;
  };
  farm_steps: string[];
}

/** The dashboard's compact view of one row, with farm plans generated in the page. */
export interface RadarRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  age_days: number | null;
  implied_value_usd: number;
  category_multiple: number;
  growth_multiplier: number;
  maturity_multiplier: number;
  breadth_multiplier: number;
}

/** A live-token protocol: it already trades, so the board shows the market's own value. */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  mcap_usd: number | null;
  change_7d: number | null;
}

/** One category's multiple, as computed from the snapshot's live-token protocols. */
export interface CategoryMultiple {
  category: string;
  live_count: number;
  raw_median: number | null;
  multiple: number;
  uses_global: boolean;
}

/** Everything the dashboard needs: the board, the live set, and the model it runs. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  model: ModelConstants;
  model_version: string;
  watchlist_size: number;
  board_size: number;
  early_size: number;
  live_size: number;
  global_multiple: number;
  category_multiples: CategoryMultiple[];
  watchlist: string[];
  rows: RadarRow[];
  live: LiveRow[];
}

/** Why the snapshot is not one this model can score. */
export class SnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotError';
  }
}

const DAY_MS = 86_400_000;

/** A finite number, else `fallback`. */
function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** The median of a non-empty list of numbers. */
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** A whole day count from `from` to `to`, clamped at zero; null when either date is absent or bad. */
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}

/**
 * The category multiples, computed from the snapshot's own live-token protocols: for each
 * category with at least `min_live_count` live-token protocols, the median of market-cap /
 * TVL over those protocols, with each protocol's ratio capped at `ratio_cap` first (a token
 * never counts as trading at more than the TVL it secures), then shrunk toward the global
 * median by `shrink_count` pseudo-counts and clamped. A category with fewer live-token
 * protocols has no measurable multiple of its own — one token, however richly it trades,
 * cannot set a category's multiple — so it uses the global median, and `uses_global` says
 * so. Categories with no live-token protocol likewise use the global median.
 */
export function categoryMultiples(snapshot: Snapshot, model: ModelConstants = MODEL): { global: number; byCategory: Map<string, number>; table: CategoryMultiple[] } {
  const live = snapshot.protocols.filter((p) => p.mcap_usd !== null && p.mcap_usd > 0 && p.tvl_usd > 0);
  const capped = (p: SnapshotProtocol): number => Math.min(p.mcap_usd! / p.tvl_usd, model.ratio_cap);
  const global = live.length > 0 ? median(live.map(capped)) : 0.25;
  const byCat = new Map<string, number[]>();
  for (const p of live) {
    const key = p.category ?? 'Other';
    const list = byCat.get(key);
    if (list) list.push(capped(p));
    else byCat.set(key, [capped(p)]);
  }
  const byCategory = new Map<string, number>();
  const table: CategoryMultiple[] = [];
  for (const [cat, ratios] of [...byCat.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const raw = median(ratios);
    const usesGlobal = ratios.length < model.min_live_count;
    const multiple = usesGlobal
      ? global
      : Math.min(model.multiple_cap, Math.max(model.multiple_floor, (ratios.length * raw + model.shrink_count * global) / (ratios.length + model.shrink_count)));
    byCategory.set(cat, multiple);
    table.push({ category: cat, live_count: ratios.length, raw_median: Math.round(raw * 10000) / 10000, multiple: Math.round(multiple * 10000) / 10000, uses_global: usesGlobal });
  }
  return { global: Math.round(global * 10000) / 10000, byCategory, table };
}

/** The four multipliers and the implied value one protocol gets under `model`. */
export function impliedValue(
  protocol: SnapshotProtocol,
  asOf: string,
  categoryMultiple: number,
  model: ModelConstants,
): { implied: number; growthPct: number; growthMult: number; maturityMult: number; breadthMult: number; age: number | null } {
  const age = ageDays(asOf, protocol.listed_at);
  const rawGrowth = finite(protocol.change_7d, 0);
  const growthPct = Math.min(model.growth_cap, Math.max(model.growth_floor, rawGrowth));
  const growthMult = 1 + (growthPct / 100) * model.growth_weight;
  const ageForModel = age ?? model.unknown_age_days;
  const maturityMult = model.maturity_floor + (Math.min(Math.max(ageForModel, 0), model.maturity_days) / model.maturity_days) * model.maturity_range;
  const extraChains = Math.min(Math.max(protocol.chains.length - 1, 0), model.breadth_max_chains);
  const breadthMult = 1 + extraChains * model.breadth_per_chain;
  const base = protocol.tvl_usd * categoryMultiple;
  const implied = Math.max(1, Math.round(base * growthMult * maturityMult * breadthMult));
  return { implied, growthPct, growthMult, maturityMult, breadthMult, age };
}

/** DefiLlama's version-marker rule: a name ending in a release is a pool of another protocol. */
const VERSIONED = /\s(V\d+(\.\d+)?|v\d+(\.\d+)?|\d+\.\d+)$/;

/** Whether a protocol records no token at all. */
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.gecko_id === null && p.symbol === null;
}

/**
 * Whether a protocol is one the board may rank. The board applies the house's own watchlist
 * rule to every protocol, using only the snapshot's ten fields: pre-token, not a wrapped,
 * staked or bridged product of a token that already trades (no Bridge-family or CEX category,
 * no whole word wrapped / staked / staking in the name, no name beginning with an exchange's
 * name), and not a versioned pool. Without this, WBTC, Coinbase Bridge and Binance's staked
 * bitcoin would sit at the top of a "pre-token" board — each is a product of a token that
 * already trades, not a launch still to come. The watchlist passes this rule by construction,
 * so coverage is never at risk.
 */
const EXCLUDED_CATEGORIES = new Set(['Bridge', 'Canonical Bridge', 'Liquid Staking', 'Liquid Restaking', 'Restaked BTC', 'CEX']);
const WRAPPED_WORD = /\b(wrapped|staked|staking)\b/i;
const EXCHANGE_NAMES = ['Binance', 'Coinbase', 'Bybit', 'Kraken', 'Bitget', 'OKX', 'Bitfinex', 'Gemini'];

export function isRankable(p: SnapshotProtocol): boolean {
  if (!isPreToken(p)) return false;
  if (p.category !== null && EXCLUDED_CATEGORIES.has(p.category)) return false;
  if (VERSIONED.test(p.name)) return false;
  if (WRAPPED_WORD.test(p.name)) return false;
  if (EXCHANGE_NAMES.some((e) => p.name.startsWith(e))) return false;
  return true;
}

/** The snapshot's protocol by slug. */
function bySlug(protocols: SnapshotProtocol[]): Map<string, SnapshotProtocol> {
  return new Map(protocols.map((p) => [p.slug, p]));
}

/** The protocols the board ranks, strongest first, with ranks 1..n. */
export function buildBoard(snapshot: Snapshot, model: ModelConstants = MODEL): BoardRow[] {
  const index = bySlug(snapshot.protocols);
  const { byCategory, global } = categoryMultiples(snapshot, model);
  const chosen = new Map<string, SnapshotProtocol>();
  // The watchlist is the floor: every slug, even one the snapshot no longer carries.
  for (const slug of snapshot.watchlist) {
    const p = index.get(slug);
    if (p !== undefined) chosen.set(slug, p);
  }
  // The early radar: EVERY other rankable pre-token protocol, not just the largest. A radar
  // that stops at the top 160 by TVL misses the small launches it exists to find.
  for (const p of snapshot.protocols) {
    if (!chosen.has(p.slug) && isRankable(p)) chosen.set(p.slug, p);
  }

  const scored = [...chosen.values()].map((p) => {
    const multiple = byCategory.get(p.category ?? 'Other') ?? global;
    const { implied, growthPct, growthMult, maturityMult, breadthMult, age } = impliedValue(p, snapshot.as_of, multiple, model);
    return { p, multiple, implied, growthPct, growthMult, maturityMult, breadthMult, age };
  });
  scored.sort((a, b) => b.implied - a.implied || (a.p.slug < b.p.slug ? -1 : a.p.slug > b.p.slug ? 1 : 0));
  return scored.map((s, i) => ({
    rank: i + 1,
    slug: s.p.slug,
    name: s.p.name,
    category: s.p.category,
    chains: s.p.chains,
    tvl_usd: s.p.tvl_usd,
    change_7d: s.p.change_7d,
    mcap_usd: s.p.mcap_usd,
    listed_at: s.p.listed_at,
    gecko_id: s.p.gecko_id,
    symbol: s.p.symbol,
    token_status: 'pre-token',
    age_days: s.age,
    implied_value_usd: s.implied,
    model: {
      category_multiple: s.multiple,
      growth_pct: s.growthPct,
      growth_multiplier: round4(s.growthMult),
      maturity_multiplier: round4(s.maturityMult),
      breadth_multiplier: round4(s.breadthMult),
      age_days: s.age,
    },
    farm_steps: farmSteps(s.p, s.age).map(stepText),
  }));
}

const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

/** A step as one string: its action, then its cost and time, within the gate's 20..600 characters. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** How much capital one farm position needs, from the protocol's own TVL. */
function capitalFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  return 50;
}

/** How long to hold, from the protocol's age: younger protocols get a longer qualifying window. */
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** The category's main action, in the words a farmer can follow. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Supply $${capital} of USDC to ${name} on ${chain} and keep the position open.`;
  if (c.includes('dex') || c.includes('liquidity manager')) return `Provide $${capital} of liquidity to ${name}'s main pool on ${chain} and keep the position open.`;
  if (c.includes('yield') || c.includes('leveraged farm') || c === 'farm') return `Deposit $${capital} of USDC into ${name}'s highest-yield vault on ${chain} and keep the shares.`;
  if (c.includes('bridge')) return `Bridge $${capital} of USDC to ${chain} through ${name} and use the bridged funds in its app.`;
  if (c.includes('staking') || c.includes('restak')) return `Stake $${capital} of the chain's staking asset through ${name} and keep the receipt.`;
  if (c.includes('perpetual') || c.includes('derivative')) return `Deposit $${capital} of USDC as margin on ${name} and open one small hedge.`;
  if (c.includes('prediction')) return `Fund $${capital} and place one market position on ${name}.`;
  if (c.includes('curator') || c.includes('allocator')) return `Deposit $${capital} into a ${name} vault on ${chain} and keep the shares.`;
  if (c.includes('stable')) return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain}.`;
  if (c.includes('rwa')) return `Mint $${capital} of the protocol's yield asset on ${chain} and hold it.`;
  if (c.includes('insurance')) return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy.`;
  if (c.includes('basis')) return `Deposit $${capital} of USDC into ${name}'s basis vault on ${chain} and keep the delta-neutral position open.`;
  if (c === 'chain') return `Bridge $${capital} of USDC onto ${chain} through its official bridge and use it in an app on the chain.`;
  if (c.includes('btc')) return `Mint $${capital} of the BTC-pegged asset through ${name} on ${chain} and hold it.`;
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open.`;
}

/** The category's second qualifying action: a different action from the main one, so the plan
 *  is a routine and not a single deposit. */
function secondActionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Borrow $${Math.round(capital / 2)} against the supplied collateral on ${name} and repay it a week later.`;
  if (c.includes('dex') || c.includes('liquidity manager')) return `Swap $${Math.round(capital / 2)} through ${name} on ${chain} in two trades a week apart.`;
  if (c.includes('yield') || c.includes('leveraged farm') || c === 'farm') return `Harvest the vault's rewards on ${name} once a week and restake them into the same vault.`;
  if (c.includes('bridge')) return `Send a second, smaller bridge of $${Math.round(capital / 4)} back through ${name} the following week.`;
  if (c.includes('staking') || c.includes('restak')) return `Delegate a second stake of $${Math.round(capital / 2)} to a different validator through ${name}.`;
  if (c.includes('perpetual') || c.includes('derivative')) return `Close the hedge on ${name} and open a fresh one the next week so both sides of the book are touched.`;
  if (c.includes('prediction')) return `Settle the first position on ${name} and place a second one on a different market.`;
  if (c.includes('curator') || c.includes('allocator')) return `Move $${Math.round(capital / 2)} into a second ${name} vault with a different strategy.`;
  if (c.includes('stable')) return `Swap $${Math.round(capital / 2)} of the stable asset for another asset on ${chain} and swap it back.`;
  if (c.includes('rwa')) return `Claim the yield the ${name} position earned and reinvest it in the same asset.`;
  if (c.includes('insurance')) return `Renew the ${name} cover once and file one test claim so the policy is active.`;
  if (c.includes('basis')) return `Claim the funding yield the ${name} position earned once a week and restake it into the same vault.`;
  if (c === 'chain') return `Use a second app on ${chain}: deposit $${Math.round(capital / 2)} into another protocol that runs on the chain.`;
  if (c.includes('btc')) return `Swap $${Math.round(capital / 2)} of the BTC-pegged asset for another asset on ${chain} and swap it back.`;
  return `Use ${name} a second way on ${chain}: a swap, a vote or a deposit of $${Math.round(capital / 2)}.`;
}

/**
 * A protocol's farm plan: eight steps, each an action with a cost and a time. The plan is
 * derived from the protocol's own record (category, chains, TVL, age), never from a hand-written
 * list of names. Step 4 names the position's own risk, by category, so the plan says what can
 * go wrong with this kind of position, not just what to deposit.
 */
export function farmSteps(p: SnapshotProtocol, age: number | null): FarmStep[] {
  const chain = chainOf(p);
  const capital = capitalFor(p);
  const hold = holdDaysFor(age);
  return [
    {
      text: `Use a fresh wallet that holds only the funds you plan to farm, and keep its seed phrase offline.`,
      cost: 'under $3 of gas for the first transaction',
      time: '5 minutes',
    },
    {
      text: actionFor(p, capital, chain),
      cost: `$${capital} of capital and about $${capital >= 150 ? 8 : 4} of gas`,
      time: '15 minutes to set up',
    },
    {
      text: secondActionFor(p, capital, chain),
      cost: `about $${Math.max(2, Math.round(capital / 25))} of gas`,
      time: '10 minutes',
    },
    riskFor(p, capital, chain),
    {
      text: `Make one qualifying action each week, such as a deposit, a borrow, a swap or a vote.`,
      cost: 'about $2 of gas a week',
      time: '10 minutes a week',
    },
    {
      text: `Hold the position for at least ${hold} days so the activity is counted in more than one snapshot.`,
      cost: `the $${capital} stays in the position`,
      time: `${hold} days`,
    },
    {
      text: `Before you withdraw, open the protocol's own points or rewards page and claim only from the link it publishes.`,
      cost: 'no fee to check, and never pay to claim',
      time: '10 minutes',
    },
    {
      text: `Write the wallet, the dates and every transaction in a farm log so you can repeat the position or unwind it.`,
      cost: 'nothing but the log',
      time: '5 minutes',
    },
  ];
}

/** The risk of this kind of position, in the words a farmer can act on: what to watch while
 *  the capital is in. The cost is the cost of checking, never of the loss itself. */
function riskFor(p: SnapshotProtocol, capital: number, chain: string): FarmStep {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return { text: `Watch the borrow's health factor on ${name}: if the collateral falls, repay part of the loan or add collateral before the position is liquidated.`, cost: 'nothing to check; a liquidation would cost part of the collateral', time: '5 minutes a week' };
  if (c.includes('dex') || c.includes('liquidity manager')) return { text: `Watch for impermanent loss on ${name}: if the pool's price moves a long way, the LP shares can be worth less than holding the tokens, so check the position before adding more.`, cost: 'nothing to check; the loss is the price move itself', time: '5 minutes a week' };
  if (c.includes('yield') || c.includes('leveraged farm') || c === 'farm') return { text: `Vault yields and leverage change on ${name}: check the vault's strategy and leverage before adding more, and pull out if the leverage has risen past what you set.`, cost: 'nothing to check; a leveraged vault can lose more than it gains', time: '5 minutes a week' };
  if (c.includes('bridge')) return { text: `Bridged funds depend on ${name}'s contracts: use only the bridge page the protocol itself publishes, and keep the receipt for each crossing until the funds arrive on ${chain}.`, cost: 'nothing to check; a failed crossing strands the funds', time: '5 minutes a crossing' };
  if (c.includes('staking') || c.includes('restak')) return { text: `Staked assets can be slashed or locked on ${name}: check the unbonding wait and the slashing terms before staking more, so you know how long an exit takes.`, cost: 'nothing to check; the lock is the unbonding wait', time: '5 minutes' };
  if (c.includes('perpetual') || c.includes('derivative')) return { text: `Leverage cuts both ways on ${name}: keep the margin small, and close the hedge if funding turns against it rather than adding margin to hold it.`, cost: 'nothing to check; a losing hedge costs the margin', time: '5 minutes a week' };
  if (c.includes('prediction')) return { text: `A market position on ${name} can go to zero: never stake more than the position you planned, and settle it rather than doubling down on a lost market.`, cost: 'nothing to check; the stake is the loss', time: '5 minutes' };
  if (c.includes('curator') || c.includes('allocator')) return { text: `A curator's vault follows its strategy on ${name}: check the vault's allocation before adding more, and leave if the allocation has moved away from what you joined for.`, cost: 'nothing to check; the allocation is the risk', time: '5 minutes a week' };
  if (c.includes('stable')) return { text: `A stable asset can depeg on ${name}: check the peg and the backing before minting more, and do not hold the stable asset through a depeg.`, cost: 'nothing to check; a depeg is the loss', time: '5 minutes a week' };
  if (c.includes('rwa')) return { text: `A yield asset depends on its issuer on ${name}: check the issuer's backing and redemption terms before minting more, and know how long a redemption takes.`, cost: 'nothing to check; the issuer is the risk', time: '5 minutes' };
  if (c.includes('insurance')) return { text: `Cover pays only on its terms on ${name}: read what the policy excludes before renewing, so you do not pay for cover that would not pay out.`, cost: 'nothing to check; an exclusion voids the claim', time: '10 minutes' };
  if (c.includes('basis')) return { text: `Basis trades earn the funding rate on ${name}: if funding flips negative the position pays instead of earning, so check the rate before adding more and leave if it stays negative.`, cost: 'nothing to check; a negative funding rate is the loss', time: '5 minutes a week' };
  if (c === 'chain') return { text: `A new chain's bridge and sequencer can pause on ${name}: keep only the funds you plan to farm on ${chain}, and check the withdrawal wait before bridging more.`, cost: 'nothing to check; a paused bridge strands the funds', time: '5 minutes a week' };
  if (c.includes('btc')) return { text: `A BTC-pegged asset can depeg on ${name}: check the peg and the backing before minting more, and do not hold the asset through a depeg.`, cost: 'nothing to check; a depeg is the loss', time: '5 minutes a week' };
  return { text: `The position depends on ${name}'s contracts on ${chain}: check its audits and whether it can pause withdrawals before adding more than the $${capital} you planned.`, cost: 'nothing to check; a paused contract strands the funds', time: '10 minutes' };
}

/** The live-token protocols, by market cap, for the dashboard's Live token view. */
export function liveRows(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => !isPreToken(p) && p.category !== 'CEX')
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0) || b.tvl_usd - a.tvl_usd)
    .slice(0, LIVE_ROWS)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
    }));
}

/** A board row's compact form for data.js, with the farm plan generated in the page. */
export function radarRow(row: BoardRow): RadarRow {
  return {
    rank: row.rank,
    slug: row.slug,
    name: row.name,
    category: row.category,
    chains: row.chains,
    tvl_usd: row.tvl_usd,
    change_7d: row.change_7d,
    mcap_usd: row.mcap_usd,
    listed_at: row.listed_at,
    age_days: row.age_days,
    implied_value_usd: row.implied_value_usd,
    category_multiple: row.model.category_multiple,
    growth_multiplier: row.model.growth_multiplier,
    maturity_multiplier: row.model.maturity_multiplier,
    breadth_multiplier: row.model.breadth_multiplier,
  };
}

/** Everything the dashboard renders, from the snapshot. */
export function buildRadar(snapshot: Snapshot, model: ModelConstants = MODEL): { board: BoardRow[]; radar: RadarData } {
  const board = buildBoard(snapshot, model);
  const live = liveRows(snapshot);
  const { global, table } = categoryMultiples(snapshot, model);
  const early = board.filter((r) => !snapshot.watchlist.includes(r.slug)).length;
  const radar: RadarData = {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    model,
    model_version: MODEL_VERSION,
    watchlist_size: snapshot.watchlist.length,
    board_size: board.length,
    early_size: early,
    live_size: live.length,
    global_multiple: global,
    category_multiples: table,
    watchlist: [...snapshot.watchlist],
    rows: board.map(radarRow),
    live,
  };
  return { board, radar };
}

/** The snapshot out of a file's text, refused unless it is the shape the model scores. */
export function parseSnapshot(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot.json is not JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new SnapshotError('snapshot.json is not a JSON object');
  const o = raw as Record<string, unknown>;
  if (typeof o.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.as_of)) throw new SnapshotError('snapshot.json has no as_of date');
  if (typeof o.source !== 'string') throw new SnapshotError('snapshot.json has no source');
  if (typeof o.floor_usd !== 'number' || !Number.isSafeInteger(o.floor_usd) || o.floor_usd <= 0) throw new SnapshotError('snapshot.json has no floor_usd');
  if (!Array.isArray(o.protocols)) throw new SnapshotError('snapshot.json has no protocols array');
  if (!Array.isArray(o.watchlist) || o.watchlist.some((s) => typeof s !== 'string')) throw new SnapshotError('snapshot.json has no watchlist of slugs');
  const protocols = o.protocols.map((v, i) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new SnapshotError(`snapshot.json's protocol ${i} is not an object`);
    const p = v as Record<string, unknown>;
    if (typeof p.slug !== 'string' || typeof p.name !== 'string' || typeof p.tvl_usd !== 'number' || !Number.isFinite(p.tvl_usd)) {
      throw new SnapshotError(`snapshot.json's protocol ${i} lacks a slug, a name or a TVL`);
    }
    return {
      slug: p.slug,
      name: p.name,
      category: typeof p.category === 'string' ? p.category : null,
      chains: Array.isArray(p.chains) ? p.chains.filter((c): c is string => typeof c === 'string') : [],
      tvl_usd: p.tvl_usd,
      change_7d: typeof p.change_7d === 'number' && Number.isFinite(p.change_7d) ? p.change_7d : null,
      mcap_usd: typeof p.mcap_usd === 'number' && Number.isFinite(p.mcap_usd) ? p.mcap_usd : null,
      listed_at: typeof p.listed_at === 'string' ? p.listed_at : null,
      gecko_id: typeof p.gecko_id === 'string' ? p.gecko_id : null,
      symbol: typeof p.symbol === 'string' ? p.symbol : null,
    };
  });
  return {
    as_of: o.as_of,
    source: o.source,
    floor_usd: o.floor_usd,
    protocols,
    watchlist: o.watchlist as string[],
  };
}

/** Why a board is not one the gate will take, or null: coverage, ranks, order, one shared implied value, and farm steps. */
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  const slugs = new Set(board.map((r) => r.slug));
  const missing = snapshot.watchlist.filter((s) => !slugs.has(s));
  if (missing.length > 0) return `the board misses ${missing.length} watchlist slug${missing.length === 1 ? '' : 's'}: ${missing.slice(0, 5).join(', ')}`;
  const ranks = board.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) if (ranks[i] !== i + 1) return `rank ${i + 1} is ${ranks[i]}`;
  for (let i = 1; i < board.length; i++) if (board[i]!.implied_value_usd > board[i - 1]!.implied_value_usd) return `row ${i + 1} outranks row ${i} on implied value`;
  if (board.length >= 2 && board[0]!.implied_value_usd === board[board.length - 1]!.implied_value_usd) {
    return `all ${board.length} rows share the same implied value $${board[0]!.implied_value_usd}: a board that ranks nothing by value is not a ranking`;
  }
  for (const r of board) {
    const steps = r.farm_steps;
    if (steps.length < 3 || steps.length > 12) return `${r.slug} has ${steps.length} farm steps`;
    for (const s of steps) if (s.length < 20 || s.length > 600) return `${r.slug} has a farm step of ${s.length} characters`;
    if (!Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd <= 0) return `${r.slug} has implied value ${r.implied_value_usd}`;
  }
  return null;
}

/** A compact data.js: the dashboard's whole dataset as one script, no fetch and no network. */
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
