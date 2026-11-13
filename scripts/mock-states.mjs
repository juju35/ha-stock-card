// Mock Home Assistant registry and states shaped like the Yahoo Finance integration (iprak/yahoofinance), plus two
// generic price sensors, used to render the screenshots. Prices are made up.
export const states = {};
export const entities = {};

const yahoo = (symbol, { price, change, currency, name, market = "REGULAR", unit = currency }) => {
  const id = `sensor.yahoofinance_${symbol.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+/, "")}`;
  const prev = +(price - change).toFixed(4);
  entities[id] = { entity_id: id, platform: "yahoofinance" };
  states[id] = {
    entity_id: id,
    state: String(price),
    attributes: {
      state_class: "measurement",
      attribution: "Data provided by Yahoo Finance",
      currencySymbol: { EUR: "€", USD: "$" }[currency] ?? currency,
      symbol,
      quoteType: symbol.startsWith("^") ? "INDEX" : "EQUITY",
      quoteSourceName: "Delayed Quote",
      marketState: market,
      regularMarketPrice: price,
      regularMarketChange: change,
      regularMarketChangePercent: +((100 * change) / prev).toFixed(4),
      regularMarketPreviousClose: prev,
      regularMarketDayHigh: +(Math.max(price, prev) * 1.004).toFixed(2),
      regularMarketDayLow: +(Math.min(price, prev) * 0.996).toFixed(2),
      trending: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      unit_of_measurement: unit,
      friendly_name: name,
      icon: change > 0 ? "mdi:trending-up" : "mdi:trending-down",
    },
  };
  return id;
};

export const ids = {
  aapl: yahoo("AAPL", { price: 231.42, change: 2.87, currency: "USD", name: "Apple Inc.", market: "PRE" }),
  msft: yahoo("MSFT", { price: 418.05, change: -3.12, currency: "USD", name: "Microsoft Corporation", market: "PRE" }),
  nvda: yahoo("NVDA", { price: 142.66, change: 4.21, currency: "USD", name: "NVIDIA Corporation", market: "PRE" }),
  air: yahoo("AIR.PA", { price: 151.38, change: 1.24, currency: "EUR", name: "Airbus SE" }),
  mc: yahoo("MC.PA", { price: 642.1, change: -7.9, currency: "EUR", name: "LVMH Moët Hennessy" }),
  cac: yahoo("^FCHI", { price: 7412.55, change: 38.6, currency: "EUR", name: "CAC 40" }),
};

// Generic price sensors, of no quote integration: their change comes from their history.
const generic = (id, state, unit, name) => {
  states[id] = { entity_id: id, state: String(state), attributes: { unit_of_measurement: unit, friendly_name: name, state_class: "measurement" } };
  return id;
};
ids.btc = generic("sensor.bitcoin_price", 84250.4, "EUR", "Bitcoin");
ids.gold = generic("sensor.gold_price", 2648.3, "USD", "Gold (ounce)");
// An exchange rate (1 EUR in USD), for the portfolio total converted to euros.
ids.eurusd = generic("sensor.eur_usd", 1.0862, "USD", "EUR/USD");
