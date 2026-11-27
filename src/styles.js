// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const BASE_STYLE = `
  :host { --st-up: var(--success-color, #43a047); --st-down: var(--error-color, #db4437); --st-warn: var(--warning-color, #ffa600);
          --st-idle: var(--secondary-text-color, #9e9e9e); --st-accent: #6d5dfc; }
  :host { display: block; }
  ha-card { overflow: hidden; container: st-card / inline-size; }
  /* A size container has no content width: this empty grid gives the card a natural width of 300 px with no minimum,
     so it still shrinks to its track in a "1fr" grid column or a flex row (as in the other ha-* cards). */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 300px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .up { --c: var(--st-up); } .down { --c: var(--st-down); } .flat, .idle, .closed { --c: var(--st-idle); }
  .ok { --c: var(--st-up); } .warn { --c: var(--st-warn); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--st-up)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--st-up)) 15%, transparent); color: var(--c, var(--st-up)); }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  /* Tinted round icon, in the colour of the day's trend; it opens Yahoo Finance (or the url option). */
  .logo { height: 40px; width: 40px; flex: none; border-radius: 50%; display: grid; place-items: center;
          color: var(--c, var(--st-accent)); background: color-mix(in srgb, var(--c, var(--st-accent)) 16%, transparent); }
  /* Grey when nothing moves (flat day, no change known) or the market is closed. */
  .logo.idle, .logo.flat, .logo.closed { --c: var(--st-idle); }
  .logo .icon { width: 24px; height: 24px; }
  /* The source's logo (Yahoo Finance) as a badge at the icon's bottom right, as on the other ha-* cards. */
  .logo { position: relative; }
  .logo .brand { position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: 5px; object-fit: contain;
                 padding: 2px; box-sizing: border-box; background: #fff;
                 box-shadow: 0 0 0 1px var(--divider-color, rgba(0,0,0,.12)), 0 0 0 3px var(--card-background-color, #fff); }
  .banner .logo .brand { box-shadow: 0 0 0 1px rgba(13,42,69,.16), 0 1px 3px rgba(13,42,69,.18); }
  .titles { flex: 1 1 0; min-width: 5ch; display: flex; flex-direction: column; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles .sub { display: none; }
  .header .chip { line-height: 16px; box-sizing: border-box; }
  .header .chip.idle, .header .chip.flat, .header .chip.closed { color: var(--primary-text-color); }
  .chip-label { white-space: nowrap; }
  /* The status pill (classic header and banner): on the title row, 8 px after the title, only when the whole title
     and the pill's whole label fit there; otherwise on its own line under the subtitle, which then keeps one line.
     Its dot alone at 200 px or less, or when the banner has no room left for its label (pill-dot): the label stays
     in its title and for screen readers. Measured after each render (_fitPill), in every language, never by a fixed
     width. */
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .name { flex: 0 1 auto; min-width: 0; }
  .trow .chip { flex: none; }
  .titles.pill-below .trow { display: contents; }
  .titles.pill-below .sub { order: 1; }
  .titles.pill-below .chip { order: 2; align-self: flex-start; margin-top: 2px; }
  .titles.pill-dot .chip { padding: 4px; }
  .titles.pill-dot .chip .chip-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  @container (max-width: 239px) { .header { gap: 6px; } }
  @container st-card (max-width: 200px) {
    .titles .chip { padding: 4px; }
    .titles .chip .chip-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: var(--st-warn); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px;
          border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .spark-a { fill: color-mix(in srgb, var(--c) 12%, transparent); }
  .spark-l { fill: none; stroke: color-mix(in srgb, var(--c) 70%, transparent); stroke-width: 1.4; vector-effect: non-scaling-stroke; }
  .chg { color: var(--c); font-variant-numeric: tabular-nums; white-space: nowrap; }
  /* A new price flashes in the colour of its move (a new class each time, so the animation runs again). */
  .tick-up-0, .tick-up-1 { --f: var(--st-up); } .tick-down-0, .tick-down-1 { --f: var(--st-down); }
  .tick-up-0, .tick-down-0 { animation: tick0 1.2s ease-out; } .tick-up-1, .tick-down-1 { animation: tick1 1.2s ease-out; }
  @keyframes tick0 { from { background: color-mix(in srgb, var(--f) 28%, transparent); } to { background: transparent; } }
  @keyframes tick1 { from { background: color-mix(in srgb, var(--f) 28%, transparent); } to { background: transparent; } }
`;

// The illustrated header ("banner"): 90 px on both cards, the text on the sky at the left, the stock-exchange
// screen at the right, the ticker strip edge to edge at the bottom. Day and night colours.
export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; color: #1b2430;
            background: linear-gradient(90deg, #f8fafc 0%, #f3f6fa 45%, #edf2f8 100%); }
  .banner.night { color: #fff; background: linear-gradient(90deg, #182134 0%, #121a29 45%, #0f1420 100%); }
  .st-scene { position: absolute; right: 0; bottom: 10px; width: 200px; height: 80px; overflow: hidden; }
  .st-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background-size: 100% 3px; background-repeat: no-repeat;
               background-position: 0 60%; }
  .g-tick { background-color: #1f2633; background-image: repeating-linear-gradient(90deg, #8a95a5 0 3px, transparent 3px 9px); box-shadow: inset 0 2px 0 #39445a; }
  .g-tickup { background-color: #123a26; background-image: repeating-linear-gradient(90deg, #43d17a 0 3px, transparent 3px 9px); box-shadow: inset 0 2px 0 #43a047; }
  .g-tickdown { background-color: #3e1518; background-image: repeating-linear-gradient(90deg, #ff6b6f 0 3px, transparent 3px 9px); box-shadow: inset 0 2px 0 #e5484d; }
  .night .g-tick { background-color: #141a24; box-shadow: inset 0 2px 0 #2c3546; }
  .night .g-tickup { background-color: #0b2618; box-shadow: inset 0 2px 0 #2f8a45; }
  .night .g-tickdown { background-color: #2a0e10; box-shadow: inset 0 2px 0 #b8383c; }
  .st-grid line { stroke: #dfe6ef; stroke-width: .6; } .night .st-grid line { stroke: #1e2a3c; }
  line.st-cu { stroke: #43a047; } line.st-cd { stroke: #e5484d; } rect.st-cu { fill: #43a047; } rect.st-cd { fill: #e5484d; }
  .st-trend { fill: none; stroke: #2f80ed; stroke-width: 1.4; stroke-dasharray: 200; animation: st-trend 4s ease-out infinite; }
  .st-dir-down .st-trend { stroke: #d68f00; }
  .st-tapebg { fill: #1f2329; } .night .st-tapebg { fill: #05070b; }
  .st-tape { font: 6.4px monospace; fill: #e6e9ee; animation: st-tape var(--st-dur, 12s) linear infinite; }
  .st-tu { fill: #43c463; } .st-td { fill: #ff6b6b; } .st-tf { fill: #aab2bd; }
  .st-pill rect { fill: #9aa3ae; } .st-pill text { font: 700 6px sans-serif; fill: #fff; }
  .st-closed .st-tape, .st-closed .st-trend { animation: none; }
  @keyframes st-tape { to { transform: translateX(var(--st-len, -240px)); } }
  @keyframes st-trend { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
  .htext { position: absolute; left: 12px; top: 6px; bottom: 16px; right: 126px; display: flex; align-items: center; gap: 10px; min-width: 0; }
  /* Title row: the title, then the status pill 8 px after it (in the icon's colour, see .trow); the subtitle under. */
  .htext .titles { flex: 1 1 auto; min-width: 0; justify-content: center; gap: 3px; }
  .htext .name { font-weight: 600; }
  .banner .chip { box-sizing: border-box; line-height: 16px;
                  background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .chip .dot { width: 7px; height: 7px; }
  .htext .sub { color: #5c6470; min-width: 0; }
  .night .htext .sub { color: rgba(255,255,255,.75); }
  .banner .logo { position: relative; background: rgba(255,255,255,.72); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .banner.night .logo { color: color-mix(in srgb, var(--c) 78%, #fff); background: rgba(255,255,255,.1); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  /* The expand / collapse button: 24 px, round, frosted, in the banner's top right corner. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; width: 24px; height: 24px; margin: 0; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
                  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  /* Narrow card: no room for the screen beside the text, the sky and the strip stay. */
  .banner + .content { padding-top: 12px; }
  @container (max-width: 259px) { .st-scene { display: none; } .htext { right: 12px; } :host([mini]) .htext { right: 36px; } }
`;

// Appended last to every card style: with "reduce motion" set, nothing animates.
export const MOTION_STYLE = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
`;

export const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 10px; }
  .total { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 12px;
           background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .total .k { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); }
  .total .k .icon { width: 16px; height: 16px; }
  .total .rate { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
  .total.norate .rate { color: var(--st-warn); }
  .total .v { font-size: 22px; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .total .d { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; }
  .total .d .muted { font-size: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); }
  .section-title .count { text-transform: none; letter-spacing: 0; font-weight: 400; }
  .sort { margin-left: auto; flex: none; max-width: 55%; height: 26px; padding: 0 4px; font: inherit; font-size: 12px; border-radius: 8px;
          cursor: pointer; text-transform: none; letter-spacing: 0; border: 1px solid var(--divider-color, rgba(127,127,127,.25));
          background: transparent; color: var(--primary-text-color); }
  .sort option { background: var(--card-background-color, #fff); color: var(--primary-text-color); }
  .sort:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  /* One grid for the whole list (rows are subgrids), so the sparklines and prices line up from row to row. */
  .list { display: grid; grid-template-columns: minmax(0, 1fr) 72px minmax(76px, auto); column-gap: 10px; }
  .list.nospark { grid-template-columns: minmax(0, 1fr) minmax(76px, auto); }
  .row { grid-column: 1 / -1; display: grid; grid-template-columns: subgrid; align-items: center; padding: 6px 4px;
         margin: 0 -4px; border-radius: 8px; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.15)); }
  .row:last-child { border-bottom: none; }
  .row:hover { background: color-mix(in srgb, var(--primary-text-color) 4%, transparent); }
  .row .who { min-width: 0; }
  .row .sym { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .nm { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row .spark { width: 72px; height: 28px; display: block; }
  .row .px { text-align: right; min-width: 0; }
  .row .price { display: inline-block; font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; border-radius: 4px; padding: 0 2px; margin: 0 -2px; }
  .row .chg { font-size: 12px; }
  .row.na .price, .row.na .sym { color: var(--secondary-text-color); }
  @container (max-width: 279px) {
    .list { grid-template-columns: minmax(0, 1fr) minmax(70px, auto); }
    .row .spark { display: none; }
  }
`;

export const MINI_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 6px; }
  .mtotal { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 13px; }
  .mtotal .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mtotal b { font-size: 16px; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .metric { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(62px, auto); align-items: center; gap: 8px;
            font-size: 13px; padding: 3px 6px; margin: 0 -6px; border-radius: 6px; overflow: hidden; }
  .metric > :not(.spark) { position: relative; }
  /* The period's curve behind the row, in the colour of its trend. */
  .metric .spark { position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; }
  .metric .spark .spark-l { stroke: color-mix(in srgb, var(--c) 45%, transparent); }
  .metric .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
  .metric .price { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; border-radius: 4px; padding: 0 2px; }
  .metric .chg { text-align: right; font-weight: 500; }
  .metric.na .lbl, .metric.na .price { color: var(--secondary-text-color); }
  .foot { font-size: 12px; color: var(--secondary-text-color); }
  @container (max-width: 229px) {
    .metric { grid-template-columns: minmax(0, 1fr) minmax(56px, auto); }
    .metric .price { display: none; }
  }
`;
