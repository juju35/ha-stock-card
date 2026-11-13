import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { StockCard, StockMiniCard, quoteOf, quoteConfigs, totals, sortQuotes, marketOf, fmtMoney, fmtPct, spark, downsample, isYahoo, sameSig, trend, rateOf } = load(
  "stock-card.js",
  ["StockCard", "StockMiniCard", "quoteOf", "quoteConfigs", "totals", "sortQuotes", "marketOf", "fmtMoney", "fmtPct", "spark", "downsample", "isYahoo", "sameSig", "trend", "rateOf"],
);

const plain = (v) => JSON.parse(JSON.stringify(v));
const yahoo = (id, price, change, extra = {}) => ({
  entity_id: id,
  state: String(price),
  attributes: { symbol: id.split("_").pop().toUpperCase(), regularMarketPrice: price, regularMarketChange: change, regularMarketChangePercent: (100 * change) / (price - change), unit_of_measurement: "USD", ...extra },
});
const hassOf = (states, entities = {}) => ({ states, entities, language: "en" });
const base = () => ({
  "sensor.yahoofinance_aapl": yahoo("sensor.yahoofinance_aapl", 200, 2, { shortName: "Apple", marketState: "PRE" }),
  "sensor.yahoofinance_msft": yahoo("sensor.yahoofinance_msft", 400, -4, { marketState: "REGULAR" }),
  "sensor.btc": { entity_id: "sensor.btc", state: "50000", attributes: { unit_of_measurement: "EUR", friendly_name: "Bitcoin" } },
  "sensor.temperature": { entity_id: "sensor.temperature", state: "21", attributes: { unit_of_measurement: "°C" } },
});

test("Yahoo Finance sensors are recognised by registry platform or quote attributes", () => {
  const states = base();
  const hass = hassOf(states, { "sensor.other": { platform: "yahoofinance" } });
  states["sensor.other"] = { entity_id: "sensor.other", state: "1", attributes: {} };
  assert.equal(isYahoo(hass, "sensor.yahoofinance_aapl"), true);
  assert.equal(isYahoo(hass, "sensor.other"), true, "registry platform");
  assert.equal(isYahoo(hass, "sensor.btc"), false);
  assert.equal(isYahoo(hass, "sensor.temperature"), false);
});

test("without entities, every Yahoo Finance sensor is listed; with entities, only those, once", () => {
  const hass = hassOf(base());
  assert.deepEqual(plain(quoteConfigs(hass, {}).map((c) => c.entity)), ["sensor.yahoofinance_aapl", "sensor.yahoofinance_msft"]);
  assert.deepEqual(
    plain(quoteConfigs(hass, { entities: ["sensor.btc", { entity: "sensor.yahoofinance_aapl", quantity: 2 }, "sensor.btc", null] }).map((c) => c.entity)),
    ["sensor.btc", "sensor.yahoofinance_aapl"],
  );
});

test("a Yahoo Finance quote: price, day change, symbol, name and market state", () => {
  const q = quoteOf(hassOf(base()), { entity: "sensor.yahoofinance_aapl", quantity: 3, purchase_price: 150 });
  assert.equal(q.price, 200);
  assert.equal(q.change, 2);
  assert.ok(Math.abs(q.pct - 1.0101) < 1e-3);
  assert.equal(q.symbol, "AAPL");
  assert.equal(q.name, "Apple");
  assert.equal(q.market, "pre");
  assert.equal(q.value, 600);
  assert.equal(q.periodic, false);
});

test("a generic sensor takes its change from the first point of its history", () => {
  const q = quoteOf(hassOf(base()), { entity: "sensor.btc" }, [{ t: 0, v: 40000 }, { t: 1, v: 45000 }]);
  assert.equal(q.change, 10000);
  assert.equal(q.pct, 25);
  assert.equal(q.periodic, true);
  assert.equal(q.name, "Bitcoin");
  const none = quoteOf(hassOf(base()), { entity: "sensor.btc" });
  assert.equal(none.change, null, "no history, no change");
});

test("missing and unavailable sensors", () => {
  const states = base();
  states["sensor.btc"].state = "unavailable";
  const hass = hassOf(states);
  assert.equal(quoteOf(hass, { entity: "sensor.nope" }).missing, true);
  const q = quoteOf(hass, { entity: "sensor.btc", quantity: 1 });
  assert.equal(q.available, false);
  assert.equal(q.value, null);
});

test("portfolio totals, per currency, with day change and gain", () => {
  const hass = hassOf(base());
  const quotes = [
    quoteOf(hass, { entity: "sensor.yahoofinance_aapl", quantity: 10, purchase_price: 150 }),
    quoteOf(hass, { entity: "sensor.yahoofinance_msft", quantity: 1 }),
    quoteOf(hass, { entity: "sensor.btc", quantity: 0.5, purchase_price: 40000 }, [{ t: 0, v: 49000 }]),
  ];
  const [usd, eur] = totals(quotes);
  assert.equal(usd.unit, "USD");
  assert.equal(usd.value, 2400);
  assert.equal(usd.change, 16);
  assert.equal(usd.gain, 500, "gain only over the positions with a purchase price");
  assert.equal(eur.value, 25000);
  assert.equal(eur.change, null, "a change over the period is not the day's change");
  assert.equal(eur.gain, 5000);
  assert.equal(eur.gainPct, 25);
});

test("sorting: name, change, value; unavailable quotes last", () => {
  const qs = [
    { symbol: "B", pct: 1, value: 10, available: true },
    { symbol: "A", pct: -2, value: null, available: true },
    { symbol: "Z", pct: 5, value: 50, available: false },
    { symbol: "C", pct: 3, value: 30, available: true },
  ];
  assert.deepEqual(plain(sortQuotes(qs, "name").map((q) => q.symbol)), ["A", "B", "C", "Z"]);
  assert.deepEqual(plain(sortQuotes(qs, "change").map((q) => q.symbol)), ["C", "B", "A", "Z"]);
  assert.deepEqual(plain(sortQuotes(qs, "value").map((q) => q.symbol)), ["C", "B", "A", "Z"]);
  assert.deepEqual(plain(sortQuotes(qs, "none").map((q) => q.symbol)), ["B", "A", "C", "Z"]);
});

test("market status: the most active one", () => {
  assert.deepEqual(plain(marketOf([{ market: "closed", id: "a" }, { market: "pre", id: "b" }, { market: "open", id: "c" }])), { state: "open", id: "c" });
  assert.equal(marketOf([{ market: null }]), null);
});

test("money and percent formats follow the locale; non-ISO units are written as given", () => {
  assert.equal(fmtMoney(1234.5, "USD", "en"), "$1,234.50");
  assert.equal(fmtMoney(1234.5, "EUR", "fr").replace(/\s/g, " "), "1 234,50 €");
  assert.equal(fmtMoney(0.1234, "USD", "en"), "$0.1234", "4 decimals under 1");
  assert.equal(fmtMoney(512.3, "GBp", "en"), "512.30 GBp");
  assert.equal(fmtMoney(2, "USD", "en", { sign: true }), "+$2.00");
  assert.equal(fmtMoney(10, "USD", "en", { decimals: 0 }), "$10");
  assert.equal(fmtMoney(null, "USD", "en"), "—");
  assert.equal(fmtPct(1.234, "en"), "+1.23%");
  assert.equal(fmtPct(-0.5, "fr").replace(/\s/g, " "), "-0,50 %");
});

test("sparkline: coloured by its own trend, broken over gaps, nothing under two points", () => {
  assert.equal(spark([{ t: 0, v: 1 }], 10, 10, 1), "");
  const up = spark([{ t: 0, v: 1 }, { t: 5, v: 2 }], 10, 10, 1);
  assert.match(up, /class="spark up"/);
  const down = spark([{ t: 0, v: 2 }, { t: 1, v: 1 }, { t: 9, v: 0.5 }], 10, 10, 1);
  assert.match(down, /class="spark down"/);
  assert.equal((down.match(/M/g) || []).length, 4, "two segments, in the line and the area");
  assert.equal(downsample(Array.from({ length: 1000 }, (_, i) => ({ t: i, v: i }))).length, 241);
  assert.equal(trend(0), "flat");
});

const make = (Cls, states, config = {}) => {
  const el = new Cls();
  el._config = config;
  el._hass = hassOf(states);
  return el;
};

test("the full card lists the quotes with the portfolio total and the market chip", () => {
  const el = make(StockCard, base(), { entities: [{ entity: "sensor.yahoofinance_aapl", quantity: 2 }, "sensor.yahoofinance_msft"] });
  const html = el._render();
  assert.match(html, /class="total"/);
  assert.match(html, /\$400\.00/, "position value 2 × 200");
  assert.match(html, /Market open/);
  assert.match(html, /data-entity="sensor\.yahoofinance_msft"/);
  assert.match(html, /\+\$2\.00 \(\+1\.01%\)/);
});

test("change_display, show_total and show_market_state", () => {
  const el = make(StockCard, base(), { entities: [{ entity: "sensor.yahoofinance_aapl", quantity: 2 }], change_display: "percent", show_total: false, show_market_state: false });
  const html = el._render();
  assert.doesNotMatch(html, /class="total"/);
  assert.doesNotMatch(html, /Market/);
  assert.match(html, />\+1\.01%</);
});

test("no quote: an explanation instead of an empty card", () => {
  const el = make(StockCard, { "sensor.temperature": base()["sensor.temperature"] });
  assert.match(el._render(), /No quote found/);
});

test("attributes are escaped", () => {
  const states = base();
  states["sensor.yahoofinance_aapl"].attributes.shortName = `<img src=x onerror="alert(1)">`;
  const html = make(StockCard, states)._render();
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img src=x"));
});

test("only http(s) URLs open from the icon", () => {
  assert.match(make(StockCard, base(), { url: "javascript:alert(1)" })._render(), /href="https:\/\/finance\.yahoo\.com"/);
  assert.match(make(StockCard, base(), { url: "https://example.org" })._render(), /href="https:\/\/example\.org"/);
});

test("a moved price gets a new tick class each time", () => {
  const states = base();
  const el = make(StockCard, states, { entities: ["sensor.yahoofinance_aapl"] });
  assert.doesNotMatch(el._render(), /price tick-/);
  el._hass = hassOf({ ...states, "sensor.yahoofinance_aapl": yahoo("sensor.yahoofinance_aapl", 201, 3) });
  assert.match(el._render(), /price tick-up-0/);
  el._hass = hassOf({ ...states, "sensor.yahoofinance_aapl": yahoo("sensor.yahoofinance_aapl", 202, 4) });
  assert.match(el._render(), /price tick-up-1/);
  el._hass = hassOf({ ...states, "sensor.yahoofinance_aapl": yahoo("sensor.yahoofinance_aapl", 199, 1) });
  assert.match(el._render(), /price tick-down-0/);
});

test("the mini card keeps max_items rows, says how many are left and has a detail button", () => {
  const el = make(StockMiniCard, base(), { entities: ["sensor.yahoofinance_aapl", "sensor.yahoofinance_msft", "sensor.btc"], max_items: 2 });
  const html = el._render();
  assert.equal((html.match(/class="metric/g) || []).length, 2);
  assert.match(html, /\+1 more/);
  assert.match(html, /class="zoom"/);
  el._zoomed = true;
  assert.match(el._render(), /class="list/, "zoomed in: the full card");
  assert.doesNotMatch(make(StockMiniCard, base(), { zoom: false })._render(), /class="zoom"/);
});

test("the signature follows the quotes' states only", () => {
  const states = base();
  const el = make(StockCard, states, { entities: ["sensor.yahoofinance_aapl"] });
  const a = el._signature();
  el._hass = hassOf({ ...states, "sensor.temperature": { ...states["sensor.temperature"], state: "22" } });
  el._hass.entities = a[0];
  assert.ok(sameSig(a, el._signature()));
});

test("history: statistics first, state history for the sensors without statistics", async () => {
  const states = base();
  const calls = [];
  const el = make(StockCard, states, { entities: ["sensor.yahoofinance_aapl", "sensor.btc"] });
  el._update = () => {};
  el._hass.callWS = async (msg) => {
    calls.push(msg);
    if (msg.type === "recorder/statistics_during_period") return { "sensor.yahoofinance_aapl": [{ start: 1000, mean: 190 }, { start: 2000, mean: 195 }] };
    return { "sensor.btc": [{ s: "48000", lu: 1 }, { s: "49000", lu: 2 }, { s: "unavailable", lu: 3 }] };
  };
  el._history(["sensor.yahoofinance_aapl", "sensor.btc"]);
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(calls[0].period, "5minute");
  assert.deepEqual(plain(calls[1].entity_ids), ["sensor.btc"]);
  const h = el._history(["sensor.yahoofinance_aapl", "sensor.btc"]);
  assert.equal(h["sensor.btc"].length, 3, "two valid states and the live price");
  assert.equal(h["sensor.btc"][0].t, 1000, "seconds are read as seconds");
  assert.equal(h["sensor.yahoofinance_aapl"].at(-1).v, 200, "ends on the live price");
});

test("the mini card folds back on a tap elsewhere, not on a press in the card, and when it leaves the page", () => {
  const el = make(StockMiniCard, base(), { entities: ["sensor.yahoofinance_aapl"] });
  el._update = () => {}; // no rendering here, only the state
  el._zoomed = true;
  el._unzoom.tap({ composedPath: () => [el] });
  assert.equal(el._zoomed, true, "a slider pressed in the card and released outside does not fold it");
  el._unzoom.tap({ composedPath: () => [{ localName: "ha-more-info-dialog" }] });
  assert.equal(el._zoomed, true, "a tap in a dialog opened from the card keeps it");
  el._unzoom.tap({ composedPath: () => [] });
  assert.equal(el._zoomed, false);
  el._zoomed = true;
  el.disconnectedCallback();
  assert.equal(el._zoomed, false, "back compact once off the page");
});

// Yahoo Finance currency pair: EURUSD=X is the price of 1 EUR in USD.
const fx = (symbol, price) => ({
  entity_id: `sensor.yahoofinance_${symbol.toLowerCase().replace("=", "_")}`,
  state: String(price),
  attributes: { symbol, regularMarketPrice: price, unit_of_measurement: symbol.slice(3, 6) },
});
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg ?? ""} ${a} != ${b}`);

test("exchange rates: option (currency or pair, number or sensor), then the Yahoo Finance pairs, both directions", () => {
  const states = { ...base(), "sensor.yahoofinance_eurusd_x": fx("EURUSD=X", 1.25), "sensor.usd_eur": { state: "0.8", attributes: {} } };
  const hass = hassOf(states);
  near(rateOf(hass, { currency: "EUR" }, "USD", "EUR").factor, 0.8, "found from EURUSD=X, inverted");
  assert.equal(rateOf(hass, { currency: "EUR" }, "USD", "EUR").entity, "sensor.yahoofinance_eurusd_x");
  near(rateOf(hass, { currency: "USD" }, "EUR", "USD").factor, 1.25, "EURUSD=X, as it is");
  near(rateOf(hass, { exchange_rates: { USD: 0.9 } }, "USD", "EUR").factor, 0.9, "a currency key: 1 USD = 0.9 EUR");
  near(rateOf(hass, { exchange_rates: { EURUSD: 1.1 } }, "USD", "EUR").factor, 1 / 1.1, "a pair key: 1 EUR = 1.1 USD");
  near(rateOf(hass, { exchange_rates: { USD: "sensor.usd_eur" } }, "USD", "EUR").factor, 0.8, "a sensor without a pair");
  near(rateOf(hass, { exchange_rates: { USD: "sensor.yahoofinance_eurusd_x" } }, "USD", "EUR").factor, 0.8, "a Yahoo pair sensor decides the direction");
  assert.equal(rateOf(hass, {}, "JPY", "EUR"), null, "no rate");
  assert.equal(rateOf(hassOf({ ...base(), "sensor.bad": { state: "unavailable", attributes: {} } }), { exchange_rates: { JPY: "sensor.bad", CHF: 0 } }, "JPY", "EUR"), null);
  assert.equal(rateOf(hass, { exchange_rates: { CHF: 0 } }, "CHF", "EUR"), null, "a rate must be positive");
});

test("currency: one total in that currency, day change and gain converted; a currency with no rate keeps its own", () => {
  const states = { ...base(), "sensor.yahoofinance_eurusd_x": fx("EURUSD=X", 1.25), "sensor.jp": { state: "1000", attributes: { unit_of_measurement: "JPY" } } };
  const hass = hassOf(states);
  const quotes = [
    quoteOf(hass, { entity: "sensor.yahoofinance_aapl", quantity: 10, purchase_price: 150 }),
    quoteOf(hass, { entity: "sensor.btc", quantity: 0.5, purchase_price: 40000 }, [{ t: 0, v: 49000 }]),
    quoteOf(hass, { entity: "sensor.jp", quantity: 2 }),
  ];
  const [eur, jpy] = totals(quotes, { hass, config: { currency: "eur" } });
  assert.equal(eur.unit, "EUR");
  near(eur.value, 2000 * 0.8 + 25000);
  near(eur.change, 20 * 0.8, "only the Yahoo quote knows its day change");
  near(eur.gain, 500 * 0.8 + 5000);
  near(eur.pct, (100 * 16) / (1600 + 25000 - 16));
  assert.equal(eur.noRate, false);
  assert.deepEqual(plain(eur.rates), [{ from: "USD", factor: 0.8, entity: "sensor.yahoofinance_eurusd_x" }]);
  assert.equal(jpy.unit, "JPY");
  assert.equal(jpy.value, 2000);
  assert.equal(jpy.noRate, true);
  assert.equal(totals(quotes).length, 3, "no currency: one total per currency, as before");
});

test("currency: London pence are converted through pounds", () => {
  const states = { "sensor.lse": { state: "500", attributes: { unit_of_measurement: "GBp" } } };
  const hass = hassOf(states);
  const [eur] = totals([quoteOf(hass, { entity: "sensor.lse", quantity: 100 })], { hass, config: { currency: "EUR", exchange_rates: { GBP: 1.2 } } });
  assert.equal(eur.unit, "EUR");
  near(eur.value, 600, "100 × 500 GBp = 500 GBP = 600 EUR");
});

test("the cards show the converted total with its rate, or say a currency has no rate", () => {
  const states = { ...base(), "sensor.yahoofinance_eurusd_x": fx("EURUSD=X", 1.25) };
  const entities = [{ entity: "sensor.yahoofinance_aapl", quantity: 10 }, { entity: "sensor.btc", quantity: 1 }];
  const html = make(StockCard, states, { entities, currency: "EUR" })._render();
  assert.equal((html.match(/class="total/g) || []).length, 1, "one total");
  assert.match(html, /€51,600\.00/);
  assert.match(html, /1 USD = €0\.8000/);
  assert.match(html, /data-entity="sensor\.yahoofinance_eurusd_x"/, "the rate opens its sensor");
  const none = make(StockCard, base(), { entities, currency: "EUR" })._render();
  assert.match(none, /class="total norate"/);
  assert.match(none, /no rate to EUR/);
  assert.match(none, /\$2,000\.00/, "the dollars stay in dollars");
  const mini = make(StockMiniCard, base(), { entities, currency: "EUR" })._render();
  assert.match(mini, /Portfolio · no rate to EUR/);
  assert.match(make(StockMiniCard, states, { entities, currency: "EUR" })._render(), /€51,600\.00/);
});

test("the signature follows the exchange rates of a converted total", () => {
  const states = { ...base(), "sensor.yahoofinance_eurusd_x": fx("EURUSD=X", 1.25), "sensor.rate": { state: "0.9", attributes: {} } };
  const el = make(StockCard, states, { entities: ["sensor.yahoofinance_aapl"], currency: "EUR", exchange_rates: { CHF: "sensor.rate" } });
  const sig = el._signature();
  assert.ok(sig.includes(states["sensor.rate"]));
  assert.ok(sig.includes(states["sensor.yahoofinance_eurusd_x"]));
  assert.ok(!make(StockCard, states, { entities: ["sensor.yahoofinance_aapl"] })._signature().includes(states["sensor.yahoofinance_eurusd_x"]));
});

test("exchange_rates must be a mapping", () => {
  const el = new StockCard();
  assert.throws(() => el.setConfig({ exchange_rates: [1] }), /exchange_rates/);
});
