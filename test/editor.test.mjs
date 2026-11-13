import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { StockCardEditor, StockMiniCardEditor } = load("stock-card.js", ["StockCardEditor", "StockMiniCardEditor"]);

const plain = (v) => JSON.parse(JSON.stringify(v));
const editor = (Cls, config) => {
  const e = new Cls();
  e._config = config;
  e._hass = { states: {}, language: "en" };
  return e;
};

test("editor: portfolio fields round-trip into entity objects, plain ids stay plain", () => {
  const e = editor(StockCardEditor, { entities: [{ entity: "sensor.a", name: "A", quantity: 2 }, "sensor.b"] });
  const data = e._data();
  assert.deepEqual(plain(data.entities), ["sensor.a", "sensor.b"]);
  assert.equal(data["qty|sensor.a"], 2);
  const out = e._toConfig({ ...data, "cost|sensor.a": 10, "qty|sensor.b": 3 });
  assert.deepEqual(plain(out.entities), [{ entity: "sensor.a", name: "A", quantity: 2, purchase_price: 10 }, { entity: "sensor.b", quantity: 3 }]);
  assert.equal(out.show_title, undefined, "defaults are left out");
  assert.equal(out.history_period, undefined);
});

test("editor: clearing a quantity writes the id back, removing every quote removes entities", () => {
  const e = editor(StockCardEditor, { entities: [{ entity: "sensor.a", quantity: 2 }] });
  assert.deepEqual(plain(e._toConfig({ ...e._data(), "qty|sensor.a": undefined }).entities), ["sensor.a"]);
  assert.equal(e._toConfig({ ...e._data(), entities: [] }).entities, undefined);
});

test("editor schemas: the mini card offers the full card's options (its detail view), plus max items and zoom", () => {
  const names = (schema) => schema.flatMap((s) => (s.schema ? names(s.schema) : [s.name])).filter(Boolean);
  const full = names(editor(StockCardEditor, { entities: ["sensor.a"] })._schema());
  for (const name of ["qty|sensor.a", "cost|sensor.a", "change_display", "decimals", "show_title", "show_subtitle"]) assert.ok(full.includes(name), name);
  assert.ok(!full.includes("max_items"));
  assert.ok(!full.includes("zoom"));
  const mini = names(editor(StockMiniCardEditor, { entities: ["sensor.a"] })._schema());
  for (const name of full) assert.ok(mini.includes(name), `mini editor misses ${name}`);
  assert.ok(mini.includes("max_items"));
  assert.ok(mini.includes("zoom"));
});

test("editor: decimals is kept when set, left out when emptied", () => {
  const e = editor(StockMiniCardEditor, { entities: ["sensor.a"] });
  assert.equal(e._toConfig({ ...e._data(), decimals: 3 }).decimals, 3);
  assert.equal(e._toConfig({ ...e._data(), decimals: undefined }).decimals, undefined);
  assert.equal(e._data().show_title, true);
});

test("editor: currency and a rate sensor per foreign currency, folded into exchange_rates", () => {
  const e = editor(StockCardEditor, { entities: ["sensor.a", "sensor.b", "sensor.c"], currency: "EUR", exchange_rates: { GBP: 1.17 } });
  e._hass = {
    language: "en",
    states: {
      "sensor.a": { state: "1", attributes: { unit_of_measurement: "USD" } },
      "sensor.b": { state: "1", attributes: { unit_of_measurement: "GBp" } },
      "sensor.c": { state: "1", attributes: { unit_of_measurement: "EUR" } },
    },
  };
  assert.deepEqual(plain(e._rateUnits()), ["USD"], "no field for the card's currency, nor for a rate given as a number");
  const schema = JSON.stringify(e._schema());
  assert.match(schema, /"currency"/);
  assert.match(schema, /rate\|USD/);
  assert.match(schema, /USD → EUR rate/);
  const out = e._toConfig({ ...e._data(), "rate|USD": "sensor.eurusd" });
  assert.deepEqual(plain(out.exchange_rates), { GBP: 1.17, USD: "sensor.eurusd" });
  e._config = out;
  assert.equal(e._data()["rate|USD"], "sensor.eurusd");
  assert.deepEqual(plain(e._toConfig({ ...e._data(), "rate|USD": undefined }).exchange_rates), { GBP: 1.17 });
  assert.equal(e._toConfig({ ...e._data(), currency: "usd" }).currency, "USD");
  assert.equal(e._toConfig({ ...e._data(), currency: "" }).currency, undefined, "no currency: left out");
});

test("editor: the mini card offers the currency too, no rate field without a currency", () => {
  const e = editor(StockMiniCardEditor, { entities: ["sensor.a"] });
  e._hass = { language: "en", states: { "sensor.a": { state: "1", attributes: { unit_of_measurement: "USD" } } } };
  const schema = JSON.stringify(e._schema());
  assert.match(schema, /"currency"/);
  assert.doesNotMatch(schema, /rate\|/);
});
