/*
 * Stock Card for Home Assistant
 * https://github.com/juju35/ha-stock-card
 *
 * Lovelace cards for stock and market quotes: the sensors of the Yahoo Finance integration
 * (https://github.com/iprak/yahoofinance), found on their own, and any other price sensor given in the configuration.
 * Yahoo Finance sensors are recognised by their platform in the entity registry, or by their quote attributes
 * (symbol and regularMarketPrice / regularMarketChange) when they have no registry entry.
 */
import { STRINGS } from "./i18n/strings.js";

export const VERSION = "__VERSION__";
export const YAHOO_SITE = "https://finance.yahoo.com";
// The Yahoo Finance logo, inlined by scripts/build.mjs: the badge on the header icon.
export const IMG_YAHOO = "__IMG_YAHOO__";

export const ICONS = {
  // mdi:trending-up, mdi:trending-down and mdi:trending-neutral: the header icon, after the day's status.
  up: "M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z",
  down: "M16,18L18.29,15.71L13.41,10.83L9.41,14.83L2,7.41L3.41,6L9.41,12L13.41,8L19.71,14.29L22,12V18H16Z",
  flat: "M22,12L18,8V11H3V13H18V16L22,12Z",
  // mdi:sort, the sort menu.
  sort: "M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z",
  // mdi:wallet-outline, the portfolio total.
  wallet:
    "M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V16.72C21.59,16.37 22,15.74 22,15V9C22,8.26 21.59,7.63 21,7.28V5A2,2 0 0,0 19,3H5M5,5H19V7H13A2,2 0 0,0 11,9V15A2,2 0 0,0 13,17H19V19H5V5M13,9H20V15H13V9M16,10.5A1.5,1.5 0 0,0 14.5,12A1.5,1.5 0 0,0 16,13.5A1.5,1.5 0 0,0 17.5,12A1.5,1.5 0 0,0 16,10.5Z",
  // mdi:arrow-expand and mdi:arrow-collapse, the mini card's detail button.
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
};


export const LANG_OPTIONS = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Locale of the numbers: Home Assistant's own language when its base matches the card's language
// (keeps the region, e.g. de-CH or fr-CA), otherwise the card's language. Home Assistant's "pt" is
// European Portuguese, which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
export const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

// Plural rules of a dictionary: pt is European Portuguese, where 0 takes the plural (Intl's "pt" is Brazilian).
export const pluralLocale = (code) => (code === "pt" ? "pt-PT" : code);

// Counted noun ("4 quotes"): the language's Intl.PluralRules form (key_one, key_few, key_many…) when the
// dictionary has it, else the key itself.
export const tn = (hass, config, key, n) => {
  const code = lang(hass, config);
  const v = Number(n);
  if (Number.isFinite(v)) {
    const form = STRINGS[code][`${key}_${new Intl.PluralRules(pluralLocale(code)).select(v)}`];
    if (form) return form;
  }
  return t(hass, config, key);
};

export const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// Number formats are cached: Intl.NumberFormat is slow to build and a card formats a few dozen numbers per render.
export const _formats = new Map();
export const nf = (locale, opts) => {
  const key = `${locale}|${JSON.stringify(opts)}`;
  let f = _formats.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat(locale, opts);
    } catch (_err) {
      // An unknown currency code (a 3-letter unit that is not one): the number alone.
      const { style, currency, currencyDisplay, ...rest } = opts;
      f = new Intl.NumberFormat(locale, rest);
    }
    _formats.set(key, f);
  }
  return f;
};

// An ISO 4217 code (EUR, USD): formatted by Intl with its symbol. Anything else (GBp, the pence of the London
// exchange, "$", "BTC") is written after the number as given.
export const isIso = (unit) => /^[A-Z]{3}$/.test(unit || "");

// Decimals of a price: the `decimals` option, else 2, and 4 under 1 (a penny stock or a currency rate).
export const priceDecimals = (v, decimals) => (Number.isInteger(decimals) ? decimals : Math.abs(v) < 1 && v !== 0 ? 4 : 2);

export const fmtMoney = (v, unit, locale, { decimals, sign = false } = {}) => {
  if (v === null) return "—";
  const d = priceDecimals(v, decimals);
  const opts = { minimumFractionDigits: d, maximumFractionDigits: d, ...(sign ? { signDisplay: "exceptZero" } : {}) };
  if (isIso(unit)) return nf(locale, { ...opts, style: "currency", currency: unit, currencyDisplay: "narrowSymbol" }).format(v);
  const n = nf(locale, opts).format(v);
  return unit ? `${n} ${unit}` : n;
};

// "+1.23%" in the card's locale ("+1,23 %" in French).
export const fmtPct = (v, locale, sign = true) =>
  v === null
    ? "—"
    : nf(locale, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, ...(sign ? { signDisplay: "exceptZero" } : {}) }).format(v / 100);

// Class of a change: up (green), down (red), flat or unknown (grey).
export const trend = (v) => (v === null || v === undefined ? "idle" : v > 0 ? "up" : v < 0 ? "down" : "flat");

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

// Same values, compared by identity: used to skip a render when nothing the card shows has changed.
export const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML (as in the other ha-* cards): nodes whose tag is unchanged are
// kept, so keyboard focus, hover and CSS animations survive an update. Rows carry a data-key (their entity id) and
// are matched by it wherever a new sort moved them; nodes without a data-key are matched by position.
export const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
export const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
export const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
export const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
export const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    place(cur, o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
export const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};
