// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { LANG_OPTIONS, fmtLang, isIso, lang, t } from "./core.js";
import { quoteConfigs } from "./quotes.js";
import { SORTS, majorUnit, targetCurrency } from "./currency-conversion-portfolio.js";
import { PERIODS } from "./sparklines.js";
import { STRINGS } from "./i18n/strings.js";

// The quotes are picked in an entity list; each one's quantity and purchase price (the portfolio) are number
// fields named `qty|<entity>` and `cost|<entity>`, folded back into `entities` objects in the saved YAML.
export const PORTFOLIO_FIELD = /^(qty|cost)\|(.+)$/;
// The sensor of each exchange rate, a field named `rate|<currency>`, folded back into `exchange_rates`.
export const RATE_FIELD = /^rate\|(.+)$/;

// Currencies offered for the total (any other ISO code can be typed in).
export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "AUD", "NZD", "HKD", "SGD", "CNY", "INR", "KRW", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF",
  "RON", "BGN", "RSD", "UAH", "TRY", "ILS", "ZAR", "BRL", "MXN"];

// "EUR — euro", the name in the editor's language when the browser knows it.
export const currencyLabel = (code, locale) => {
  try {
    const name = new Intl.DisplayNames([locale], { type: "currency" }).of(code);
    return name && name !== code ? `${code} — ${name}` : code;
  } catch (_err) {
    return code;
  }
};

export class StockEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // Currencies of the quotes that need a rate to the `currency` option: the editor offers a sensor for each one
  // (unless the rate is a number, kept as written in YAML).
  _rateUnits() {
    const to = targetCurrency(this._config);
    if (!to || !this._hass) return [];
    const rates = this._config.exchange_rates || {};
    const units = quoteConfigs(this._hass, this._config).map((c) => {
      const a = this._hass.states?.[c.entity]?.attributes || {};
      return majorUnit(a.unit_of_measurement || a.currency || a.currencySymbol || "")[0];
    });
    return [...new Set(units)].filter((u) => isIso(u) && u !== to && typeof rates[u] !== "number").sort();
  }

  _ids() {
    return quoteConfigs({ states: {} }, { entities: this._config.entities || [] }).map((c) => c.entity);
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const ids = this._ids();
    const name = (id) => this._hass?.states?.[id]?.attributes?.symbol || this._hass?.states?.[id]?.attributes?.friendly_name || id;
    return [
      { name: "title", selector: { text: {} } },
      { name: "url", selector: { text: { type: "url" } } },
      { name: "entities", selector: { entity: { multiple: true, filter: { domain: "sensor" } } } },
      {
        name: "currency",
        selector: {
          select: {
            mode: "dropdown",
            custom_value: true,
            options: [{ value: "", label: tr("currency_none") }, ...CURRENCIES.map((value) => ({ value, label: currencyLabel(value, fmtLang(this._hass, this._config)) }))],
          },
        },
      },
      ...(this._rateUnits().length
        ? [
            {
              type: "grid",
              name: "",
              schema: this._rateUnits().map((u) => ({
                name: `rate|${u}`,
                label: t(this._hass, this._config, "rate", { from: u, to: targetCurrency(this._config) }),
                selector: { entity: { filter: { domain: "sensor" } } },
              })),
            },
          ]
        : []),
      ...(ids.length
        ? [
            {
              type: "expandable",
              name: "",
              title: tr("portfolio_section"),
              schema: ids.map((id) => ({
                type: "grid",
                name: "",
                schema: [
                  { name: `qty|${id}`, label: `${name(id)}: ${tr("quantity")}`, selector: { number: { min: 0, step: "any", mode: "box" } } },
                  { name: `cost|${id}`, label: `${name(id)}: ${tr("purchase_price")}`, selector: { number: { min: 0, step: "any", mode: "box" } } },
                ],
              })),
            },
          ]
        : []),
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "history_period",
            selector: { select: { mode: "dropdown", options: Object.keys(PERIODS).map((value) => ({ value, label: tr(`period_${value}`) })) } },
          },
          { name: "sort_by", selector: { select: { mode: "dropdown", options: SORTS.map((value) => ({ value, label: tr(`sort_${value}`) })) } } },
          {
            name: "change_display",
            selector: {
              select: { mode: "dropdown", options: ["both", "percent", "absolute"].map((value) => ({ value, label: tr(`change_${value}`) })) },
            },
          },
          ...(this.constructor.mini ? [{ name: "max_items", selector: { number: { min: 1, max: 20, step: 1, mode: "box" } } }] : []),
          { name: "decimals", selector: { number: { min: 0, max: 8, step: 1, mode: "box" } } },
          {
            name: "illustration_theme",
            selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } },
          },
        ],
      },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([n]) => ({ name: n, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANG_OPTIONS.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  // Defaults of the fields: left out of the saved YAML.
  _defaults() {
    return { ...Object.fromEntries(this.constructor.toggles), history_period: "1d", sort_by: "none", change_display: "both", max_items: 5, illustration_theme: "auto" };
  }

  // Form data: the configuration with defaults filled in, entities as ids, and the portfolio fields.
  _data() {
    const data = { ...this._defaults(), ...this._config, entities: this._ids() };
    for (const item of this._config.entities || []) {
      if (!item || typeof item !== "object") continue;
      if (item.quantity !== undefined) data[`qty|${item.entity}`] = item.quantity;
      if (item.purchase_price !== undefined) data[`cost|${item.entity}`] = item.purchase_price;
    }
    for (const u of this._rateUnits()) if (typeof this._config.exchange_rates?.[u] === "string") data[`rate|${u}`] = this._config.exchange_rates[u];
    return data;
  }

  // The configuration to save from the form's value: entity objects keep their own keys (name…), get the
  // portfolio fields, and are written back as plain ids when nothing else is left; defaults are dropped.
  _toConfig(value) {
    const config = {};
    const extra = {};
    const rates = { ...(value.exchange_rates || {}) };
    for (const [k, v] of Object.entries(value)) {
      const r = RATE_FIELD.exec(k);
      if (r) {
        if (typeof v === "string" && v) rates[r[1]] = v;
        else delete rates[r[1]];
        continue;
      }
      const m = PORTFOLIO_FIELD.exec(k);
      if (m) {
        (extra[m[2]] ??= {})[m[1] === "qty" ? "quantity" : "purchase_price"] = v;
        continue;
      }
      config[k] = v;
    }
    const before = Object.fromEntries((this._config.entities || []).filter((e) => e && typeof e === "object").map((e) => [e.entity, e]));
    const entities = (config.entities || []).map((id) => {
      const { entity, quantity, purchase_price, ...own } = before[id] || {};
      const item = { entity: id, ...own };
      const x = extra[id] || {};
      if (x.quantity !== undefined && x.quantity !== null && x.quantity !== "") item.quantity = x.quantity;
      if (x.purchase_price !== undefined && x.purchase_price !== null && x.purchase_price !== "") item.purchase_price = x.purchase_price;
      return Object.keys(item).length === 1 ? id : item;
    });
    if (entities.length) config.entities = entities;
    else delete config.entities;
    if (Object.keys(rates).length) config.exchange_rates = rates;
    else delete config.exchange_rates;
    if (typeof config.currency === "string") config.currency = config.currency.trim().toUpperCase();
    const defaults = this._defaults();
    for (const [k, v] of Object.entries(config)) {
      if (v === "" || v === undefined || v === null || (k in defaults && v === defaults[k])) delete config[k];
    }
    return config;
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => s.label ?? t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => STRINGS[lang(this._hass, this._config)][`${s.name}_helper`];
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = this._toConfig({ ...ev.detail.value });
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
        this._render();
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    // hass is pushed on every state change: data and schema are reassigned only when they changed.
    const data = this._data();
    const dataKey = JSON.stringify(data);
    if (dataKey !== this._dataKey) {
      this._dataKey = dataKey;
      this._form.data = data;
    }
    const schemaKey = JSON.stringify([this._ids(), lang(this._hass, this._config), targetCurrency(this._config), this._rateUnits()]);
    if (schemaKey !== this._schemaKey) {
      this._schemaKey = schemaKey;
      this._form.schema = this._schema();
    }
  }
}

export class StockCardEditor extends StockEditorBase {
  static get mini() {
    return false;
  }

  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_name", true],
      ["show_history", true],
      ["show_total", true],
      ["show_market_state", true],
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the compact view's
// length and the detail button.
export class StockMiniCardEditor extends StockCardEditor {
  static get mini() {
    return true;
  }

  static get toggles() {
    return [...StockCardEditor.toggles, ["zoom", true]];
  }
}
