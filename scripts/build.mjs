// Bundles the ES modules of src/ (entry src/index.js, assembled by scripts/bundle.mjs) into the single HACS file dist/stock-card.js, inlining the Yahoo Finance logo
// (the badge on the header icon).
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";
import { bundle } from "./bundle.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

const out = bundle("src/index.js")
  .replace("__VERSION__", pkg.version)
  .replace("__IMG_YAHOO__", `data:image/png;base64,${readFileSync(`${root}images/yahoofinance.png`).toString("base64")}`);

const target = `${root}dist/stock-card.js`;
mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(target, out);
console.log(`Built dist/stock-card.js (${(out.length / 1024).toFixed(1)} KB)`);

// Translations: English stays in the bundle, each other language goes to dist/stock-card.i18n.<lang>.js,
// fetched when a card needs it (scripts/i18n-split.mjs).
if (process.argv[1] === fileURLToPath(import.meta.url)) splitDist(`${root}dist`, "stock-card.js", { version: pkg.version });
