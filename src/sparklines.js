// ---------------------------------------------------------------------------
// Sparklines
// ---------------------------------------------------------------------------
import { esc, trend } from "./core.js";

// Window and statistics period of each sparkline period. The 5-minute statistics are kept 10 days by the recorder,
// the hourly ones for ever.
export const PERIODS = {
  "1d": { window: 864e5, stat: "5minute", step: 3e5 },
  "5d": { window: 5 * 864e5, stat: "hour", step: 36e5 },
  "1m": { window: 30 * 864e5, stat: "hour", step: 36e5 },
  "3m": { window: 91 * 864e5, stat: "day", step: 864e5 },
  "1y": { window: 365 * 864e5, stat: "day", step: 864e5 },
};
export const periodOf = (config) => (PERIODS[config?.history_period] ? config.history_period : "1d");
export const HIST_REFRESH = 5 * 60000;
// At most this many points per sparkline: history without statistics can hold thousands of states.
export const MAX_POINTS = 240;

export const downsample = (points, max = MAX_POINTS) => {
  if (points.length <= max) return points;
  const step = points.length / max;
  const out = [];
  for (let i = 0; i < max; i++) out.push(points[Math.floor(i * step)]);
  out.push(points.at(-1));
  return out;
};

// Sparkline of { t, v } points over `window` ending at `end`, scaled from its lowest to its highest value (a price
// moves a few percent: from 0 it would look flat), on a real time axis: the line is broken where two points are
// more than three periods apart (recorder stopped, market closed overnight on a 24 h window is kept joined by the
// statistics). Coloured by its own trend: last point against the first.
export function spark(points, end, window, step, cls = "spark") {
  if (!points || points.length < 2) return "";
  const vs = points.map((p) => p.v);
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  const span = hi - lo || Math.abs(hi) || 1;
  const x = (t) => Math.max(0, Math.min(100, (100 * (t - (end - window))) / window)).toFixed(2);
  const y = (v) => (28 - ((v - lo) / span) * 26).toFixed(2);
  const segs = [];
  for (const [i, p] of points.entries()) {
    if (!i || p.t - points[i - 1].t > 3 * step) segs.push([]);
    segs.at(-1).push(p);
  }
  const line = segs.map((g) => `M${g.map((p) => `${x(p.t)},${y(p.v)}`).join("L")}${g.length === 1 ? "h0.4" : ""}`).join("");
  const area = segs.map((g) => `M${x(g[0].t)},30L${g.map((p) => `${x(p.t)},${y(p.v)}`).join("L")}L${x(g.at(-1).t)},30Z`).join("");
  return `<svg class="${cls} ${trend(vs.at(-1) - vs[0])}" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="spark-a" d="${area}"/><path class="spark-l" d="${line}"/></svg>`;
}

// ---------------------------------------------------------------------------
// The illustration: a stock-exchange screen at the right of a 200 × 80 banner picture (x 80–200; the left is open
// sky for the card's text): a candlestick chart over a grid, its trend line, and a ticker tape scrolling the card's
// own quotes. Above a 10 px ticker strip, edge to edge, in the colour of the day (green up, red down, grey closed).
// ---------------------------------------------------------------------------

// Candles [x, open, close, high, low] of a rising session; a falling one is the same chart flipped.
export const ST_CANDLES = [
  [96, 40, 30, 46, 26],
  [106, 36, 28, 44, 24],
  [116, 34, 40, 46, 30],
  [126, 38, 30, 42, 26],
  [136, 30, 24, 36, 20],
  [146, 26, 32, 34, 22],
  [156, 30, 22, 34, 18],
  [166, 22, 18, 28, 14],
  [176, 20, 26, 30, 16],
  [186, 24, 16, 28, 12],
];
// Ticker items when the card has no quote with a change to show.
export const ST_TAPE_FALLBACK = [
  ["AAPL", "+1.3%", "up"],
  ["MSFT", "-0.7%", "down"],
  ["NVDA", "+3.0%", "up"],
];
// Width of a monospace glyph at the tape's font size (6.4), and the tape's speed (picture units per second).
export const ST_GLYPH = 3.85;
export const ST_TAPE_SPEED = 20;

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day picture after sunset).
export const stIsNight = (hass, config) => {
  if (config?.illustration_theme === "night") return true;
  if (config?.illustration_theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// The banner picture. `state` is up | down | flat | closed (the closed market keeps the direction of its last
// session in `dir`), `tape` the ticker items [label, change, trend], `closedText` the pill of a closed market.
// `uid` keeps each card's clip path apart on a page with several cards.
export function stSceneSvg(uid, { state, dir, tape, closedText }) {
  const up = dir !== "down";
  const candles = ST_CANDLES.map(([x, o, c, h, l]) => (up ? [x, o, c, h, l] : [x, 72 - o, 72 - c, 72 - l, 72 - h]));
  const bars = candles
    .map(([x, o, c, h, l]) => {
      const cls = c < o ? "st-cu" : "st-cd";
      return `<line class="${cls}" x1="${x}" y1="${Math.min(h, l)}" x2="${x}" y2="${Math.max(h, l)}"/><rect class="${cls}" x="${x - 3}" y="${Math.min(o, c)}" width="6" height="${Math.max(2, Math.abs(o - c))}"/>`;
    })
    .join("");
  const trendD = `M92 ${up ? 50 : 22} ${candles.map(([x, o, c]) => `L${x} ${(o + c) / 2}`).join(" ")}`;
  // The tape: the items laid end to end (repeated to fill the 120-unit screen), twice, scrolled by one length.
  let items = tape.length ? tape : ST_TAPE_FALLBACK;
  const widthOf = (list) => list.reduce((w, [s, v]) => w + (s.length + v.length + 1) * ST_GLYPH + 8, 0);
  while (widthOf(items) < 130) items = [...items, ...(tape.length ? tape : ST_TAPE_FALLBACK)];
  const len = Math.round(widthOf(items));
  let x = 84;
  const run = [0, 1]
    .map(() =>
      items
        .map(([s, v, t]) => {
          const at = x;
          x += (s.length + v.length + 1) * ST_GLYPH + 8;
          return `<text x="${at.toFixed(1)}" y="75">${esc(s)} <tspan class="st-t${t === "down" ? "d" : t === "up" ? "u" : "f"}">${esc(v)}</tspan></text>`;
        })
        .join(""),
    )
    .join("");
  const pillW = Math.round(closedText.length * 3.5 + 12);
  const pill =
    state === "closed"
      ? `<g class="st-pill"><rect x="88" y="3" width="${pillW}" height="11" rx="5.5"/><text x="${88 + pillW / 2}" y="10.6" text-anchor="middle">${esc(closedText.toUpperCase())}</text></g>`
      : "";
  return `<svg class="st-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
    <defs><clipPath id="st-tape-${uid}"><rect x="80" y="64" width="120" height="16"/></clipPath></defs>
    <g class="st-grid">${[14, 28, 42, 56].map((y) => `<line x1="86" y1="${y}" x2="200" y2="${y}"/>`).join("")}</g>
    ${bars}
    <path class="st-trend" d="${trendD}"/>
    <rect class="st-tapebg" x="80" y="64" width="120" height="16"/>
    <g clip-path="url(#st-tape-${uid})"><g class="st-tape" style="--st-len:-${len}px;--st-dur:${(len / ST_TAPE_SPEED).toFixed(1)}s">${run}</g></g>
    ${pill}
  </svg>`;
}
