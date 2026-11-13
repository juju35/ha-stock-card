# Changelog

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
