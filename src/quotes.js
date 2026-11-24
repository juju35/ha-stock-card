// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------
import { num } from "./core.js";

// A Yahoo Finance sensor: its registry platform, else its quote attributes (YAML sensors may have no registry entry).
export const isYahoo = (hass, id) => {
  if (!id.startsWith("sensor.")) return false;
  if (hass.entities?.[id]?.platform === "yahoofinance") return true;
  const a = hass.states[id]?.attributes;
  return !!a && typeof a.symbol === "string" && ("regularMarketPrice" in a || "regularMarketChange" in a);
};

// The Yahoo Finance sensors of Home Assistant, by entity id.
export const yahooEntities = (hass) =>
  Object.keys(hass.states || {})
    .filter((id) => isYahoo(hass, id))
    .sort();

// The configured quotes: `entities` (entity ids, or objects with entity, name, quantity, purchase_price),
// else every Yahoo Finance sensor. Duplicates are kept once.
export const quoteConfigs = (hass, config) => {
  const list = Array.isArray(config.entities) && config.entities.length ? config.entities : yahooEntities(hass);
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const c = typeof item === "string" ? { entity: item } : item && typeof item === "object" ? { ...item } : null;
    if (!c?.entity || seen.has(c.entity)) continue;
    seen.add(c.entity);
    out.push(c);
  }
  return out;
};

export const MARKET_STATES = { REGULAR: "open", PRE: "pre", PREPRE: "pre", POST: "post", POSTPOST: "post", CLOSED: "closed" };

// Everything a row shows, from a sensor and its configuration. `hist` (optional): its points over the period,
// used for the change of a sensor that gives none (anything but Yahoo Finance).
export const quoteOf = (hass, c, hist) => {
  const s = hass.states[c.entity];
  if (!s) return { id: c.entity, missing: true, name: c.name || c.entity };
  const a = s.attributes || {};
  const yahoo = isYahoo(hass, c.entity);
  const price = num(s.state) ?? num(a.regularMarketPrice);
  const unit = a.unit_of_measurement || a.currency || a.currencySymbol || "";
  let change = num(a.regularMarketChange ?? a.change);
  let pct = num(a.regularMarketChangePercent ?? a.change_percent ?? a.changePercent);
  const prev = num(a.regularMarketPreviousClose ?? a.previous_close);
  // Previous close known: the change follows the live price (the state may be newer than the change attributes).
  if (prev && price !== null && change === null) change = price - prev;
  if (change !== null && pct === null && price !== null && price - change) pct = (100 * change) / (price - change);
  // No change of the day: the change over the sparkline's period, from its first point.
  let periodic = false;
  if (change === null && price !== null && hist?.length) {
    const first = hist[0].v;
    change = price - first;
    pct = first ? (100 * change) / first : null;
    periodic = true;
  }
  const symbol = a.symbol || (yahoo ? c.entity.replace(/^sensor\.yahoofinance_/, "").toUpperCase() : "");
  const name = c.name || a.shortName || a.longName || a.friendly_name || symbol || c.entity;
  const qty = num(c.quantity);
  const cost = num(c.purchase_price);
  return {
    id: c.entity,
    yahoo,
    symbol,
    name,
    price,
    unit,
    change,
    pct,
    periodic,
    market: yahoo ? MARKET_STATES[String(a.marketState || "").toUpperCase()] || null : null,
    available: price !== null,
    qty,
    cost,
    value: qty !== null && price !== null ? qty * price : null,
  };
};
