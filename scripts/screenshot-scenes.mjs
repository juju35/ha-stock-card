// The README captures rendered by scripts/screenshots.mjs: one entry per PNG (`shots`) and per GIF (`gifs`).
// Kept apart from the renderer so the tests can check them without a browser.
import { ids } from "./mock-states.mjs";

// A portfolio in euros: quantities and purchase prices.
const portfolio = {
  title: "Investments",
  entities: [
    { entity: ids.air, quantity: 40, purchase_price: 128.5 },
    { entity: ids.mc, quantity: 6, purchase_price: 702 },
    { entity: ids.cac, name: "CAC 40" },
    { entity: ids.btc, quantity: 0.12, purchase_price: 61200 },
  ],
};

// Every capture is rendered in both themes: each light shot gets a `-dark` twin with the exact same setup.
const lightShots = [
  { file: "card", type: "stock-card", theme: "light", width: 460, config: {} },
  { file: "card-portfolio", type: "stock-card", theme: "light", width: 460, config: { ...portfolio, sort_by: "value" } },
  { file: "card-generic", type: "stock-card", theme: "light", width: 460, config: { title: "Commodities", entities: [ids.btc, ids.gold], history_period: "5d" } },
  { file: "mini-card", type: "stock-mini-card", theme: "light", width: 380, config: { max_items: 5 } },
  { file: "mini-card-portfolio", type: "stock-mini-card", theme: "light", width: 380, config: portfolio },
  { file: "mini-card-zoom", type: "stock-mini-card", theme: "light", width: 460, config: portfolio, zoom: true },
];
const withDarkTwins = (light) => [...light, ...light.map((s) => ({ ...s, file: `${s.file}-dark`, theme: "dark" }))];
export const shots = withDarkTwins(lightShots);

// One looping GIF per animation, replaying `events` (a click on a card element, or a state update) at fixed times;
// every animation is paused and stepped frame by frame, so the GIF is identical whatever the machine's speed.
const tick = (id, price, change) => ({ [id]: { state: String(price), attributes: { regularMarketPrice: price, regularMarketChange: change } } });
const lightGifs = [
  {
    file: "card-ticks",
    type: "stock-card",
    theme: "light",
    width: 460,
    config: { entities: [ids.aapl, ids.msft, ids.nvda, ids.air] },
    seconds: 4,
    events: [
      { at: 0.5, states: { ...tick(ids.aapl, 231.88, 3.33), ...tick(ids.msft, 417.6, -3.57) } },
      { at: 1.6, states: { ...tick(ids.nvda, 142.31, 3.86), ...tick(ids.air, 151.62, 1.48) } },
      { at: 2.7, states: { ...tick(ids.aapl, 231.5, 2.95), ...tick(ids.msft, 418.2, -2.97) } },
    ],
  },
  {
    file: "mini-card-zoom",
    type: "stock-mini-card",
    theme: "light",
    width: 460,
    config: portfolio,
    seconds: 4,
    measure: [".zoom"],
    events: [
      { at: 0.6, click: ".zoom" },
      { at: 2.9, click: ".zoom" },
    ],
  },
];
export const gifs = withDarkTwins(lightGifs);
