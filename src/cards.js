// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { ICONS, IMG_YAHOO, YAHOO_SITE, esc, fmtLang, fmtMoney, fmtPct, isIso, morph, nf, num, sameSig, svgIcon, t, tn, trend } from "./core.js";
import { quoteConfigs, quoteOf } from "./quotes.js";
import { SORTS, marketOf, rateEntities, sortQuotes, targetCurrency, totals } from "./currency-conversion-portfolio.js";
import { HIST_REFRESH, PERIODS, downsample, periodOf, spark, stIsNight, stSceneSvg } from "./sparklines.js";
import { BANNER_STYLE, BASE_STYLE, FULL_STYLE, MINI_STYLE, MOTION_STYLE } from "./styles.js";

// Instance counter: unique SVG ids for each card on a page.
export let stUid = 0;

// The banner's ground strip (the ticker strip), that the title block keeps clear of, and the gap between the title
// and the status pill on its row (.trow).
export const PILL_GROUND_PX = 10;
export const PILL_GAP_PX = 8;

export class StockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._uid = ++stUid;
    this._prices = {};
    this._ticks = {};
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Keyboard access: Enter or Space on a focusable row acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // The sort menu: kept while the card lives, not in the configuration (sort_by sets the default).
    this.shadowRoot.addEventListener("change", (ev) => {
      if (ev.target?.dataset?.ctl !== "sort") return;
      this._sort = ev.target.value;
      this._update();
    });
  }

  static getConfigElement() {
    return document.createElement("stock-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    // Render only when a state the card shows has changed, not on every state change of Home Assistant.
    const sig = this._signature();
    if (sameSig(sig, this._sig)) return;
    this._update(sig);
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    if (config.entities !== undefined && !Array.isArray(config.entities)) throw new Error("entities must be a list");
    if (config.exchange_rates !== undefined && (typeof config.exchange_rates !== "object" || Array.isArray(config.exchange_rates)))
      throw new Error("exchange_rates must be a mapping of currencies to rates");
    this._config = config;
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._sort = undefined;
    this._html = "";
    this._update();
  }

  getCardSize() {
    const n = this._hass && this._config ? quoteConfigs(this._hass, this._config).length : 3;
    return 2 + Math.ceil(n * 0.8);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _loc() {
    return fmtLang(this._hass, this._config);
  }

  // What the render depends on: registries, language and the states of the quotes.
  _signature() {
    const h = this._hass;
    // The dark mode picks the illustration's day or night picture.
    const sig = [h.entities, h.language, h.locale?.language, h.themes?.darkMode];
    for (const c of quoteConfigs(h, this._config)) sig.push(h.states[c.entity]);
    // The exchange rates of a total converted to `currency`.
    for (const id of rateEntities(h, this._config)) sig.push(h.states[id]);
    return sig;
  }

  _update(sig) {
    if (!this._hass || !this._config) return;
    this._sig = sig ?? this._signature();
    const html = this._render();
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
    this._fitPill();
  }

  connectedCallback() {
    this._watchPill();
  }

  disconnectedCallback() {
    this._unwatchPill();
  }
  // The status pill goes on the title row, right after the title, only when the whole title and the pill's whole
  // label fit there; otherwise it takes its own line under the subtitle (the subtitle then on one line). In the
  // banner, when title, subtitle and pill still do not fit above the ground strip (or the pill's label runs past the
  // text, over the picture), the pill keeps its dot only.
  // Measured after each render and on every new width (or once the web font is loaded), never by a fixed width.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const row = t.querySelector?.(".trow");
      const name = row?.querySelector(".name");
      const chips = row ? [...row.children].filter((n) => n.classList.contains("chip")) : [];
      if (!name?.getBoundingClientRect || !chips.length) continue;
      t.classList.remove("pill-below", "pill-dot");
      // The title's whole width (scrollWidth is rounded: 1 px more, so that a title that fits is never cut).
      const need = chips.reduce((w, c) => w + PILL_GAP_PX + c.getBoundingClientRect().width, name.scrollWidth + 1);
      if (need <= row.getBoundingClientRect().width + 0.5) continue;
      t.classList.add("pill-below");
      const banner = t.closest(".banner");
      if (!banner) continue;
      const box = banner.getBoundingClientRect();
      const ground = box.bottom - PILL_GROUND_PX;
      const right = t.getBoundingClientRect().right;
      const out = [name, ...t.querySelectorAll(".sub"), ...chips].some((n) => {
        const r = n.getBoundingClientRect();
        return r.height > 0 && (r.top < box.top - 0.5 || r.bottom > ground + 0.5 || r.right > right + 0.5);
      });
      if (out) t.classList.add("pill-dot");
    }
  }

  _watchPill() {
    if (typeof ResizeObserver !== "function") return;
    this._pillResize ??= new ResizeObserver((entries) => {
      const w = Math.round(entries.at(-1).contentRect.width);
      if (w === this._pillWidth) return;
      this._pillWidth = w;
      cancelAnimationFrame(this._pillFrame);
      this._pillFrame = requestAnimationFrame(() => this._fitPill());
    });
    this._pillResize.observe(this);
    document.fonts?.ready?.then(() => this._fitPill());
  }

  _unwatchPill() {
    this._pillResize?.disconnect();
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(this._pillFrame);
    this._pillWidth = null;
  }

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset?.entity);
    if (!el) return;
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.entity }, bubbles: true, composed: true }));
  }

  // The quotes, with their sparkline points, in the order picked (sort menu, else sort_by, else card order).
  _quotes() {
    const configs = quoteConfigs(this._hass, this._config);
    const hist = this._config.show_history !== false ? this._history(configs.map((c) => c.entity)) : null;
    const quotes = configs.map((c) => ({ ...quoteOf(this._hass, c, hist?.[c.entity]), points: hist?.[c.entity] ?? null }));
    const by = SORTS.includes(this._sort) ? this._sort : SORTS.includes(this._config.sort_by) ? this._config.sort_by : "none";
    this._sortUsed = by;
    // A price that moved since the last render flashes (see .tick-* in BASE_STYLE).
    for (const q of quotes) {
      const before = this._prices[q.id];
      if (q.price !== null && before !== undefined && before !== null && q.price !== before) {
        const n = this._ticks[q.id]?.n === 0 ? 1 : 0;
        this._ticks[q.id] = { dir: q.price > before ? "up" : "down", n };
      }
      this._prices[q.id] = q.price;
    }
    return sortQuotes(quotes, by, this._loc());
  }

  _tick(id) {
    const tk = this._ticks[id];
    return tk ? ` tick-${tk.dir}-${tk.n}` : "";
  }

  // Sparkline points of the quotes over the period: the recorder's statistics (mean of each period), else, for a
  // sensor without statistics (no state_class), its state history. Fetched again every 5 minutes.
  _history(ids) {
    const period = periodOf(this._config);
    const key = `${period}|${ids.join(",")}`;
    const p = PERIODS[period];
    if (ids.length && this._hass.callWS && (this._histKey !== key || Date.now() - this._histAt > HIST_REFRESH)) {
      const end = Date.now();
      const start = new Date(end - p.window).toISOString();
      this._histKey = key;
      this._histAt = end;
      const ts = (v) => (typeof v === "number" ? (v < 1e11 ? v * 1000 : v) : Date.parse(v));
      this._hass
        .callWS({ type: "recorder/statistics_during_period", start_time: start, statistic_ids: ids, period: p.stat, types: ["mean"] })
        .catch(() => ({}))
        .then(async (stats) => {
          const out = {};
          for (const id of ids) out[id] = (stats?.[id] || []).map((x) => ({ t: ts(x.start), v: x.mean }));
          const missing = ids.filter((id) => out[id].length < 2);
          if (missing.length) {
            const h = await this._hass
              .callWS({ type: "history/history_during_period", start_time: start, entity_ids: missing, minimal_response: true, no_attributes: true })
              .catch(() => ({}));
            for (const id of missing) {
              const pts = (h?.[id] || []).map((x) => ({ t: ts(x.lu ?? x.last_updated ?? x.last_changed), v: num(x.s ?? x.state) }));
              if (pts.length) out[id] = pts;
            }
          }
          if (this._histKey !== key) return;
          this._hist = Object.fromEntries(
            Object.entries(out).map(([id, pts]) => [id, downsample(pts.filter((x) => Number.isFinite(x.t) && Number.isFinite(x.v)))]),
          );
          this._histEnd = end;
          this._update();
        });
    }
    if (this._histKey !== key || !this._hist) return null;
    // The curve ends on the live price.
    return Object.fromEntries(
      Object.entries(this._hist).map(([id, pts]) => {
        const v = num(this._hass.states[id]?.state);
        return [id, v !== null && pts.length ? [...pts, { t: this._histEnd, v }] : pts];
      }),
    );
  }

  _spark(q, cls) {
    const p = PERIODS[periodOf(this._config)];
    return spark(q.points, this._histEnd, p.window, p.step, cls);
  }

  // Logo target: url option (http(s) only), else Yahoo Finance.
  _logoUrl() {
    const url = this._config.url;
    return /^https?:\/\//i.test(url || "") ? url : YAHOO_SITE;
  }

  _header(quotes, tots) {
    const c = this._config;
    const n = quotes.length;
    const known = marketOf(quotes);
    const market = c.show_market_state !== false ? known : null;
    // The day's move of the portfolio, else of the quotes on average.
    const pcts = quotes.map((q) => q.pct).filter((v) => v !== null);
    const dayTrend = tots.length === 1 && tots[0].pct !== null ? trend(tots[0].pct) : pcts.length ? trend(pcts.reduce((a, b) => a + b, 0)) : "idle";
    // Status: the market closed, else the day's trend. It colours the icon, the strip and the scene.
    const status = known?.state === "closed" ? "closed" : dayTrend === "idle" ? "flat" : dayTrend;
    const sub = [`${n} ${tn(this._hass, c, "quotes_lc", n)}`];
    const yahoo = quotes.some((q) => q.yahoo);
    if (yahoo) sub.push("Yahoo Finance");
    // The status pill, in the icon's colour: the market's state, else (no market sensor, or hidden) the day's move.
    const dayPct = tots.length === 1 && tots[0].pct !== null ? tots[0].pct : pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
    const chipText = market ? esc(this._t(`market_${market.state}`)) : dayPct === null ? "" : esc(fmtPct(dayPct, this._loc()));
    const chipEntity = market ? ` clickable" role="button" tabindex="0" data-entity="${esc(market.id)}"` : '"';
    const title = esc(c.title || this._t("title_default"));
    const logo = `<a class="logo ${status}" href="${esc(this._logoUrl())}" target="_blank" rel="noopener noreferrer" title="${title}" aria-label="${title}">${svgIcon(ICONS[status] || ICONS.flat)}${yahoo ? `<img class="brand" src="${IMG_YAHOO}" alt="Yahoo Finance">` : ""}</a>`;
    const chip = chipText
      ? `<span class="chip ${status}${chipEntity} title="${chipText}" aria-label="${chipText}"><span class="dot"></span><span class="chip-label">${chipText}</span></span>`
      : "";
    const subText = `<div class="sub" title="${esc(sub.join(" · "))}">${esc(sub.join(" · "))}</div>`;
    if (c.illustration === false)
      return `
      <div class="header">
        ${logo}
        <div class="titles">
          <div class="trow"><div class="name">${title}</div>${chip}</div>
          ${subText}
        </div>
        ${this._zoomButton()}
      </div>`;
    // The ticker tape scrolls the card's own quotes and their day change.
    const loc = this._loc();
    const tape = quotes
      .filter((q) => !q.missing && (q.pct !== null || q.change !== null))
      .slice(0, 12)
      .map((q) => {
        const label = String(q.symbol || q.name).slice(0, 10);
        const v = q.pct !== null ? fmtPct(q.pct, loc) : fmtMoney(q.change, "", loc, { decimals: c.decimals, sign: true });
        return [label, v.replace(/\s/g, ""), trend(q.change ?? q.pct)];
      });
    const dir = dayTrend === "down" ? "down" : "up";
    const scene = stSceneSvg(this._uid, { state: status, dir, tape, closedText: this._t("market_closed") });
    const night = stIsNight(this._hass, c) ? " night" : "";
    const strip = status === "up" ? "g-tickup" : status === "down" ? "g-tickdown" : "g-tick";
    return `
      <div class="banner st-${status} st-dir-${dir}${night}">
        ${scene}
        <div class="st-ground ${strip}" aria-hidden="true"></div>
        <div class="htext">
          ${logo}
          <div class="titles">
            <div class="trow"><div class="name">${title}</div>${chip}</div>
            ${subText}
          </div>
        </div>
        ${this._zoomButton()}
      </div>`;
  }

  // The illustration's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  // Button at the far right of the header: only the mini card has one.
  _zoomButton() {
    return "";
  }

  _error(key, detail = "") {
    return `<style>${BASE_STYLE}${MOTION_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}${detail ? `: ${esc(detail)}` : ""}</div></ha-card>`;
  }

  // "+1.23 (+0.85%)", "+0.85%" or "+1.23" (change_display), with " · 5 days" when it is the period's change.
  _change(q) {
    const loc = this._loc();
    const mode = ["both", "percent", "absolute"].includes(this._config.change_display) ? this._config.change_display : "both";
    if (q.change === null && q.pct === null) return "—";
    const abs = fmtMoney(q.change, isIso(q.unit) ? q.unit : "", loc, { decimals: this._config.decimals, sign: true });
    const pct = fmtPct(q.pct, loc);
    const text = mode === "percent" || q.change === null ? pct : mode === "absolute" || q.pct === null ? abs : `${abs} (${pct})`;
    return q.periodic ? `${text} · ${this._t(`period_${periodOf(this._config)}`)}` : text;
  }

  _price(q) {
    return fmtMoney(q.price, q.unit, this._loc(), { decimals: this._config.decimals });
  }

  _total(tots) {
    if (this._config.show_total === false || !tots.length) return "";
    const loc = this._loc();
    const d = this._config.decimals;
    return tots
      .map((tot) => {
        const parts = [];
        if (tot.change !== null)
          parts.push(
            `<span class="chg ${trend(tot.change)}">${esc(fmtMoney(tot.change, tot.unit, loc, { decimals: d, sign: true }))} (${esc(fmtPct(tot.pct, loc))}) <span class="muted">${esc(
              this._t("today"),
            )}</span></span>`,
          );
        if (tot.gain !== null)
          parts.push(
            `<span class="chg ${trend(tot.gain)}"><span class="muted">${esc(this._t("gain"))}</span> ${esc(fmtMoney(tot.gain, tot.unit, loc, { decimals: d, sign: true }))} (${esc(
              fmtPct(tot.gainPct, loc),
            )})</span>`,
          );
        return `<div class="total${tot.noRate ? " norate" : ""}" data-key="total-${esc(tot.unit)}">
          <div class="k">${svgIcon(ICONS.wallet)}${esc(this._t("portfolio"))}${this._rates(tot)}</div>
          <div class="v">${esc(fmtMoney(tot.value, tot.unit, loc, { decimals: d }))}</div>
          ${parts.length ? `<div class="d">${parts.join("")}</div>` : ""}
        </div>`;
      })
      .join("");
  }

  // After "Portfolio": the rates a converted total used ("1 USD = 0.9217 €", opening their sensor), or, for a
  // currency left without a rate, a note saying so.
  _rates(tot) {
    const to = targetCurrency(this._config);
    if (tot.noRate) return `<span class="rate">· ${esc(this._t("no_rate", { to }))}</span>`;
    return tot.rates
      .map((r) => {
        const text = esc(`1 ${r.from} = ${fmtMoney(r.factor, tot.unit, this._loc(), { decimals: 4 })}`);
        return r.entity
          ? `<span class="rate clickable" role="button" tabindex="0" data-entity="${esc(r.entity)}">· ${text}</span>`
          : `<span class="rate">· ${text}</span>`;
      })
      .join("");
  }

  _totals(quotes) {
    return totals(
      quotes.filter((q) => !q.missing),
      { hass: this._hass, config: this._config },
    );
  }

  _row(q) {
    const c = this._config;
    if (q.missing)
      return `<div class="row na" data-key="${esc(q.id)}"><div class="who"><div class="sym">${esc(q.name)}</div><div class="nm">${esc(this._t("unknown_entity"))}</div></div>${
        c.show_history !== false ? `<span class="spark"></span>` : ""
      }<div class="px"></div></div>`;
    const showSpark = c.show_history !== false;
    const label = q.symbol || q.name;
    const sub = [];
    if (c.show_name !== false && q.symbol && q.name !== q.symbol) sub.push(q.name);
    if (q.qty !== null) sub.push(`×${fmtNumber(q.qty, this._loc())}${q.value !== null ? ` · ${fmtMoney(q.value, q.unit, this._loc(), { decimals: c.decimals })}` : ""}`);
    if (!q.available) sub.push(this._t("unavailable"));
    const cls = trend(q.change ?? q.pct);
    return `<div class="row clickable${q.available ? "" : " na"}" role="button" tabindex="0" data-key="${esc(q.id)}" data-entity="${esc(q.id)}" aria-label="${esc(
      `${label} ${this._price(q)} ${this._change(q)}`,
    )}">
      <div class="who"><div class="sym">${esc(label)}</div>${sub.length ? `<div class="nm">${esc(sub.join(" · "))}</div>` : ""}</div>
      ${showSpark ? this._spark(q) || `<span class="spark"></span>` : ""}
      <div class="px"><div class="price${this._tick(q.id)}">${esc(this._price(q))}</div><div class="chg ${cls}">${esc(this._change(q))}</div></div>
    </div>`;
  }

  _sortMenu(quotes) {
    const opts = SORTS.filter((k) => k !== "value" || quotes.some((q) => q.value !== null));
    const by = opts.includes(this._sortUsed) ? this._sortUsed : "none";
    return `<select class="sort" data-ctl="sort" aria-label="${esc(this._t("sort_by"))}" title="${esc(this._t("sort_by"))}">${opts
      .map((k) => `<option value="${k}"${k === by ? " selected" : ""}>${esc(this._t(`sort_${k}`))}</option>`)
      .join("")}</select>`;
  }

  _render() {
    const quotes = this._quotes();
    if (!quotes.length) return this._error("no_entities");
    const tots = this._totals(quotes);
    return `<style>${BASE_STYLE}${FULL_STYLE}${this._bannerStyle()}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(quotes, tots)}
        <div class="content">
          ${this._total(tots)}
          <div>
            <div class="section-title">${esc(this._t("quotes"))}<span class="count">${quotes.length}</span>${quotes.length > 1 ? this._sortMenu(quotes) : ""}</div>
            <div class="list${this._config.show_history === false ? " nospark" : ""}">${quotes.map((q) => this._row(q)).join("")}</div>
          </div>
        </div>
      </ha-card>`;
  }
}

export const fmtNumber = (v, locale) => nf(locale, { maximumFractionDigits: 4 }).format(v);

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
export const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// A click or tap outside of the card, and not in a Home Assistant dialog opened from it.
export const isOutside = (card, ev) => !ev.composedPath().includes(card) && !inDialog(ev);

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event.
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOutside(card, ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOutside(card, ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOutside(card, ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// The mini card extends the full card: its detail button (top right, `zoom: false` removes it) switches it to the
// full card's content, same configuration, and back; a click anywhere outside the card brings it back too.
export class StockMiniCard extends StockCard {
  static getConfigElement() {
    return document.createElement("stock-mini-card-editor");
  }

  constructor() {
    super();
    this._zoomed = false;
    this.shadowRoot.addEventListener("click", (ev) => this._zoomClick(ev), true);
    this._unzoom = watchOutside(this, () => {
      if (this._zoomed) this._setZoom(false);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
    // Back on the page after leaving it: rendered again in the compact view.
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Left (another dashboard view, a conditional card hidden): back to the compact view.
    this._zoomed = false;
  }

  // A config change (the editor, say) starts over from the compact view.
  setConfig(config) {
    this._zoomed = false;
    this.setAttribute("mini", "");
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._update();
  }

  _zoomClick(ev) {
    if (!ev.target?.closest?.(".zoom")) return;
    ev.stopPropagation();
    this._setZoom(!this._zoomed);
    // Keyboard use (Enter / Space: no click count) keeps the focus on the button.
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    return `<button type="button" class="zoom" title="${esc(this._t(z ? "zoom_out" : "zoom_in"))}" aria-label="${esc(this._t(z ? "zoom_out" : "zoom_in"))}">${svgIcon(
      z ? ICONS.collapse : ICONS.expand,
    )}</button>`;
  }

  _metric(q) {
    if (q.missing) return `<div class="metric na" data-key="${esc(q.id)}"><span class="lbl">${esc(q.name)}</span><span class="price"></span><span class="chg">—</span></div>`;
    const label = q.symbol || q.name;
    const loc = this._loc();
    const pct = q.pct !== null ? fmtPct(q.pct, loc) : q.change !== null ? fmtMoney(q.change, "", loc, { decimals: this._config.decimals, sign: true }) : "—";
    return `<div class="metric clickable ${trend(q.change ?? q.pct)}${q.available ? "" : " na"}" role="button" tabindex="0" data-key="${esc(q.id)}" data-entity="${esc(
      q.id,
    )}" aria-label="${esc(`${label} ${this._price(q)} ${pct}`)}" title="${esc(q.name)}">
      ${this._config.show_history !== false ? this._spark(q) : ""}<span class="lbl">${esc(label)}</span>
      <span class="price${this._tick(q.id)}">${esc(this._price(q))}</span><span class="chg">${esc(pct)}</span>
    </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const quotes = this._quotes();
    if (!quotes.length) return this._error("no_entities");
    const tots = this._totals(quotes);
    const max = Math.max(1, Number.isInteger(this._config.max_items) ? this._config.max_items : 5);
    const shown = quotes.slice(0, max);
    const loc = this._loc();
    const total =
      this._config.show_total !== false
        ? tots
            .map(
              (tot) =>
                `<div class="mtotal" data-key="total-${esc(tot.unit)}"><span class="muted lbl">${esc(this._t("portfolio"))}${
                  tot.noRate ? ` · ${esc(this._t("no_rate", { to: targetCurrency(this._config) }))}` : ""
                }</span><span><b>${esc(
                  fmtMoney(tot.value, tot.unit, loc, { decimals: this._config.decimals }),
                )}</b>${tot.pct !== null ? ` <span class="chg ${trend(tot.pct)}">${esc(fmtPct(tot.pct, loc))}</span>` : ""}</span></div>`,
            )
            .join("")
        : "";
    return `<style>${BASE_STYLE}${MINI_STYLE}${this._bannerStyle()}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(quotes, tots)}
        <div class="content">
          ${total}
          ${shown.map((q) => this._metric(q)).join("")}
          ${quotes.length > max ? `<div class="foot">${esc(this._t("more", { n: quotes.length - max }))}</div>` : ""}
        </div>
      </ha-card>`;
  }
}
