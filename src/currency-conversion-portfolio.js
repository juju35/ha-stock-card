// ---------------------------------------------------------------------------
// Currency conversion of the portfolio total
// ---------------------------------------------------------------------------
import { isIso, num } from "./core.js";
import { yahooEntities } from "./quotes.js";

// Minor units some exchanges quote in (London in pence, Johannesburg in cents, Tel Aviv in agorot): [currency, factor].
export const MINOR_UNITS = { GBp: ["GBP", 0.01], GBX: ["GBP", 0.01], ZAc: ["ZAR", 0.01], ZAC: ["ZAR", 0.01], ILA: ["ILS", 0.01] };
export const majorUnit = (unit) => MINOR_UNITS[unit] ?? [unit, 1];

// The currency the totals are shown in (`currency`), upper case, or null when the totals stay per currency.
export const targetCurrency = (config) => {
  const c = String(config?.currency ?? "")
    .trim()
    .toUpperCase();
  return isIso(c) ? c : null;
};

// A Yahoo Finance currency pair: EURUSD=X is the price of 1 EUR in USD.
export const PAIR = /^([A-Z]{3})([A-Z]{3})=X$/;
export const pairOf = (symbol) => {
  const m = PAIR.exec(String(symbol || "").toUpperCase());
  return m ? [m[1], m[2]] : null;
};

// Factor turning an amount in `from` into `to` (1 from = factor to), from the pair [base, quote] of a rate `v`
// (1 base = v quote); null if the pair is not this one or the rate is not a positive number.
export const pairFactor = (pair, v, from, to) => {
  if (!Number.isFinite(v) || v <= 0) return null;
  if (pair[0] === from && pair[1] === to) return v;
  if (pair[0] === to && pair[1] === from) return 1 / v;
  return null;
};

// Rate of `from` into `to`, with the entity it comes from (null for a number): the `exchange_rates` option first,
// then the Yahoo Finance currency pairs of Home Assistant (EURUSD=X or USDEUR=X). An `exchange_rates` key is a
// currency (`USD: 0.92`: 1 USD = 0.92 of the card's currency) or a pair (`EURUSD: 1.085`: 1 EUR = 1.085 USD); its
// value a number or a sensor, whose own Yahoo Finance pair (EURUSD=X), when it has one, decides the direction.
export const rateOf = (hass, config, from, to) => {
  if (from === to) return { factor: 1, entity: null };
  const rates = config?.exchange_rates && typeof config.exchange_rates === "object" ? config.exchange_rates : {};
  for (const [key, val] of Object.entries(rates)) {
    const k = String(key).toUpperCase();
    const pair = k.length === 3 ? [k, to] : k.length === 6 ? [k.slice(0, 3), k.slice(3)] : null;
    if (!pair) continue;
    let v = typeof val === "number" ? val : null;
    let entity = null;
    let own = null;
    if (typeof val === "string" && hass?.states?.[val]) {
      entity = val;
      v = num(hass.states[val].state);
      own = pairOf(hass.states[val].attributes?.symbol);
    }
    const factor = pairFactor(own || pair, v, from, to);
    if (factor !== null) return { factor, entity };
  }
  for (const id of yahooEntities(hass || {})) {
    const pair = pairOf(hass.states[id].attributes?.symbol);
    const factor = pair && pairFactor(pair, num(hass.states[id].state), from, to);
    if (factor) return { factor, entity: id };
  }
  return null;
};

// The entities whose state the conversion reads: the sensors of `exchange_rates`, and every Yahoo Finance
// currency pair (looked up when no rate is given).
export const rateEntities = (hass, config) => {
  if (!targetCurrency(config)) return [];
  const own = Object.values(config.exchange_rates && typeof config.exchange_rates === "object" ? config.exchange_rates : {}).filter((v) => typeof v === "string");
  return [...own, ...yahooEntities(hass).filter((id) => pairOf(hass.states[id].attributes?.symbol))];
};

// Portfolio totals: value, change of the day, gain against the purchase prices. One per currency, or, with a
// `currency` set, one in that currency for every quote whose currency has a rate (converted at the current rate:
// the move of the rate itself is not in the day change nor in the gain), and one per currency left without a rate
// (`noRate`). Only quotes with a quantity count; the day change only adds the ones that know it.
export const totals = (quotes, { hass, config } = {}) => {
  const to = targetCurrency(config);
  const by = new Map();
  for (const q of quotes) {
    if (q.value === null) continue;
    let unit = q.unit;
    let f = 1;
    let rate = null;
    if (to) {
      const [major, minor] = majorUnit(q.unit);
      const r = isIso(major) ? rateOf(hass, config, major, to) : null;
      if (r) {
        unit = to;
        f = minor * r.factor;
        if (major !== to) rate = { from: major, factor: r.factor, entity: r.entity };
      }
    }
    const tot = by.get(unit) ?? { unit, value: 0, change: 0, hasChange: false, cost: 0, costValue: 0, hasCost: false, rates: new Map() };
    tot.value += f * q.value;
    if (q.change !== null && !q.periodic) {
      tot.change += f * q.qty * q.change;
      tot.hasChange = true;
    }
    if (q.cost !== null) {
      tot.cost += f * q.qty * q.cost;
      tot.costValue += f * q.value;
      tot.hasCost = true;
    }
    if (rate) tot.rates.set(rate.from, rate);
    by.set(unit, tot);
  }
  // The converted total first, then the currencies left as they are.
  const list = [...by.values()].sort((a, b) => Number(b.unit === to) - Number(a.unit === to));
  return list.map((tot) => {
    const before = tot.value - tot.change;
    return {
      unit: tot.unit,
      value: tot.value,
      change: tot.hasChange ? tot.change : null,
      pct: tot.hasChange && before ? (100 * tot.change) / before : null,
      gain: tot.hasCost ? tot.costValue - tot.cost : null,
      gainPct: tot.hasCost && tot.cost ? (100 * (tot.costValue - tot.cost)) / tot.cost : null,
      rates: [...tot.rates.values()],
      noRate: !!to && tot.unit !== to,
    };
  });
};

// Sorts: card order, name, change (% of the day, highest first), position value (highest first). Unavailable
// quotes always go last.
export const SORTS = ["none", "name", "change", "value"];
export const sortQuotes = (quotes, by, locale = "en") => {
  const list = [...quotes];
  const key = {
    name: null,
    change: (q) => q.pct,
    value: (q) => q.value,
  }[by];
  if (by === "name") list.sort((a, b) => String(a.symbol || a.name).localeCompare(String(b.symbol || b.name), locale));
  else if (key) list.sort((a, b) => (key(b) ?? -Infinity) - (key(a) ?? -Infinity));
  return list.sort((a, b) => Number(!a.available) - Number(!b.available));
};

// Market status of the card: the most active one of its Yahoo Finance quotes (open, then pre-market, after hours,
// closed), with the quote that gives it (opened by a click on the chip).
export const marketOf = (quotes) => {
  for (const m of ["open", "pre", "post", "closed"]) {
    const q = quotes.find((x) => x.market === m);
    if (q) return { state: m, id: q.id };
  }
  return null;
};
