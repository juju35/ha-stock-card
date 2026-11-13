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

test("editor schemas: portfolio and change display on the full card, max items on the mini card", () => {
  const names = (schema) => JSON.stringify(schema);
  const full = names(editor(StockCardEditor, { entities: ["sensor.a"] })._schema());
  assert.match(full, /qty\|sensor\.a/);
  assert.match(full, /change_display/);
  const mini = names(editor(StockMiniCardEditor, { entities: ["sensor.a"] })._schema());
  assert.doesNotMatch(mini, /qty\|/);
  assert.match(mini, /max_items/);
  assert.match(mini, /"zoom"/);
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
