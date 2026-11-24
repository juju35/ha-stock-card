// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { StockCard, StockMiniCard } from "./cards.js";
import { StockCardEditor, StockMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("stock-card", StockCard);
define("stock-mini-card", StockMiniCard);
define("stock-card-editor", StockCardEditor);
define("stock-mini-card-editor", StockMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  { type: "stock-card", name: "Stock Card", description: "Stock and market quotes (Yahoo Finance or any price sensor) with sparklines and a portfolio total." },
  { type: "stock-mini-card", name: "Stock Mini Card", description: "Compact stock quotes (Yahoo Finance or any price sensor) with the day's change." },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-stock-card" });
}

console.info(
  `%c STOCK-CARD %c v${VERSION} `,
  "color: white; background: #6d5dfc; font-weight: 700;",
  "color: #6d5dfc; background: white; font-weight: 700;",
);
