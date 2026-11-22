# Changelog

## 1.3.1 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.3.0 - 2026-11-20

### Features
- The header icon carries the Yahoo Finance logo as a badge at its bottom right (classic and illustrated headers), as the other ha-* cards show their source, when a quote comes from Yahoo Finance.

### Fixes
- The status pill's pending fit is dropped when the card leaves the page (another view, a conditional card hidden).

## 1.2.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.2.0 - 2026-11-17

### Features
- **Illustrated header** on both cards (90 px): a stock-exchange screen at the right — candlesticks with their trend line, a ticker tape scrolling the card's own quotes and their day change — over a 10 px ticker strip, edge to edge, green when the day is up, red when it is down, grey when the market is closed (the tape then stops and a "Market closed" pill shows). The title, the market status chip and the subtitle sit on the left.
- The header icon follows the status: trending up in green, trending down in red, neutral in grey for a flat day or a closed market (also in the classic header).
- The status pill is in the header icon's colour (frosted on the sky); without a market sensor it shows the day's move. It sits on the title row right after the title only when the whole title and its whole label fit there (measured, in every language); otherwise on its own line under the subtitle (then kept to one line), and only its dot when even that does not fit in the banner above the ticker strip or beside the screen, or on a card 200 px wide or less. The same rule on the classic header. The mini card's expand / collapse button sits in the banner's top right corner (24 px, frosted), like the other cards.
- **Night picture** after sunset (`sun.sun`) or with Home Assistant's dark theme; `illustration_theme: day | night` forces one. `illustration: false` keeps the classic header. Both options are in the visual editors, labelled in all 22 languages. Animations stop with "reduce motion".
- Night picture with the dark theme even while the sun is up (a day picture would glare on a dark dashboard); `illustration_theme: day | night` still forces one.

## 1.1.1 - 2026-11-14

### Fixes
- **Visual editor**: `decimals` was missing from both editors; it is offered now, labelled in all 22 languages.
- **Mini card visual editor**: its detail view is the full card, but its editor left out the title, subtitle, company names, change shown and the **Portfolio** section (quantity and purchase price per quote), though the compact view shows the portfolio total. It now offers every option of the full card, plus the compact view's length and the detail button.
- **README**: `change_display` and `show_name` are marked as working on both cards, and the numbers and pairs of `exchange_rates` as YAML only (the visual editor keeps them).

## 1.1.0 - 2026-11-13

### Features
- Currency of the portfolio total (`currency`): the total, its change of the day and the gain in one currency, such as euros for a portfolio of US stocks, through the rates of `exchange_rates` (a number or a sensor, per currency or per pair) or, with none given, the Yahoo Finance currency pairs (`EURUSD=X`). The rate used is shown next to the total; a currency with no rate keeps its own total, marked as such. Pence (`GBp`) go through pounds. Both visual editors offer the currency and a rate sensor per currency to convert ([#5](https://github.com/juju35/ha-stock-card/issues/5), suggested by @mielikki33).

## 1.0.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the detailed view of the mini card stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state.

## 1.0.0 - 2026-11-13

### Features
- **Stock Card** and **Stock Mini Card**: stock and market quotes with their price, change of the day and sparkline.
- Automatic discovery of the [Yahoo Finance](https://github.com/iprak/yahoofinance) sensors; any other price sensor can be listed too, its change then taken from its history.
- Sparklines over 24 hours, 5 days, 1 month, 3 months or 1 year (`history_period`), from the recorder's statistics or the state history.
- Optional portfolio: quantity and purchase price per quote, position values, total per currency with the day's change and the gain.
- Market status chip, sort menu (`sort_by`), price ticks, detail button on the mini card.
- Visual editor for both cards, quantities and purchase prices included.
- 22 languages, English in the bundle and the others loaded on demand.
