import assert from "node:assert/strict";
import { test } from "node:test";
import { ids, states } from "../scripts/mock-states.mjs";

// The screenshots are rendered from these mocks: each Yahoo Finance quote's change must match its previous close.
test("mock quotes are consistent", () => {
  for (const id of Object.values(ids)) {
    const a = states[id].attributes;
    if (!("regularMarketChange" in a)) continue;
    assert.ok(Math.abs(a.regularMarketPrice - a.regularMarketPreviousClose - a.regularMarketChange) < 1e-6, id);
    assert.equal(Number(states[id].state), a.regularMarketPrice, id);
  }
});
