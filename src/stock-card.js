/*
 * Stock Card for Home Assistant
 * https://github.com/juju35/ha-stock-card
 *
 * Lovelace cards for stock and market quotes: the sensors of the Yahoo Finance integration
 * (https://github.com/iprak/yahoofinance), found on their own, and any other price sensor given in the configuration.
 * Yahoo Finance sensors are recognised by their platform in the entity registry, or by their quote attributes
 * (symbol and regularMarketPrice / regularMarketChange) when they have no registry entry.
 */

const VERSION = "__VERSION__";
const YAHOO_SITE = "https://finance.yahoo.com";

const ICONS = {
  // mdi:chart-line, the header icon.
  chart: "M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z",
  // mdi:sort, the sort menu.
  sort: "M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z",
  // mdi:wallet-outline, the portfolio total.
  wallet:
    "M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V16.72C21.59,16.37 22,15.74 22,15V9C22,8.26 21.59,7.63 21,7.28V5A2,2 0 0,0 19,3H5M5,5H19V7H13A2,2 0 0,0 11,9V15A2,2 0 0,0 13,17H19V19H5V5M13,9H20V15H13V9M16,10.5A1.5,1.5 0 0,0 14.5,12A1.5,1.5 0 0,0 16,13.5A1.5,1.5 0 0,0 17.5,12A1.5,1.5 0 0,0 16,10.5Z",
  // mdi:arrow-expand and mdi:arrow-collapse, the mini card's detail button.
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
};

const STRINGS = {
  en: {
    title_default: "Stocks",
    quotes: "Quotes",
    quotes_lc: "quotes",
    quotes_lc_one: "quote",
    market_open: "Market open",
    market_pre: "Pre-market",
    market_post: "After hours",
    market_closed: "Market closed",
    portfolio: "Portfolio",
    today: "today",
    gain: "Gain",
    more: "+{n} more",
    unavailable: "Unavailable",
    no_entities: "No quote found. Is the Yahoo Finance integration installed, or are the price sensors set in the card?",
    unknown_entity: "Entity not found",
    sort_by: "Sort by",
    sort_none: "Card order",
    sort_name: "Name",
    sort_change: "Change",
    sort_value: "Position value",
    period_1d: "24 h",
    period_5d: "5 days",
    period_1m: "1 month",
    period_3m: "3 months",
    period_1y: "1 year",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    // Editor
    title: "Title (optional)",
    url: "URL opened by the icon (optional, Yahoo Finance by default)",
    entities: "Quotes (none selected: every Yahoo Finance sensor)",
    history_period: "Sparkline period",
    change_display: "Change shown",
    change_both: "Value and percentage",
    change_percent: "Percentage",
    change_absolute: "Value",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    show_name: "Show company names",
    show_history: "Show sparklines",
    show_total: "Show the portfolio total",
    show_market_state: "Show the market status",
    max_items: "Quotes shown in the compact view",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card and back",
    portfolio_section: "Portfolio (optional)",
    quantity: "quantity",
    purchase_price: "purchase price",
    currency: "Currency of the portfolio total",
    currency_helper: "Converts the total, its day change and the gain. Rates come from a Yahoo Finance currency pair (EURUSD=X) when there is one, else from the sensors below; a currency with no rate keeps its own total",
    currency_none: "Each currency apart (no conversion)",
    rate: "{from} → {to} rate (optional)",
    no_rate: "no rate to {to}",
    language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    title_default: "Bourse",
    quotes: "Cours",
    quotes_lc: "valeurs",
    quotes_lc_one: "valeur",
    market_open: "Marché ouvert",
    market_pre: "Pré-ouverture",
    market_post: "Après clôture",
    market_closed: "Marché fermé",
    portfolio: "Portefeuille",
    today: "aujourd'hui",
    gain: "Plus-value",
    more: "+{n} autres",
    unavailable: "Indisponible",
    no_entities: "Aucun cours trouvé. L'intégration Yahoo Finance est-elle installée, ou les capteurs de prix sont-ils indiqués dans la carte ?",
    unknown_entity: "Entité introuvable",
    sort_by: "Trier par",
    sort_none: "Ordre de la carte",
    sort_name: "Nom",
    sort_change: "Variation",
    sort_value: "Valeur de la position",
    period_1d: "24 h",
    period_5d: "5 jours",
    period_1m: "1 mois",
    period_3m: "3 mois",
    period_1y: "1 an",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    title: "Titre (facultatif)",
    url: "Adresse ouverte par l'icône (facultative, Yahoo Finance par défaut)",
    entities: "Valeurs (aucune choisie : tous les capteurs Yahoo Finance)",
    history_period: "Période des courbes",
    change_display: "Variation affichée",
    change_both: "Valeur et pourcentage",
    change_percent: "Pourcentage",
    change_absolute: "Valeur",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    show_name: "Afficher le nom des sociétés",
    show_history: "Afficher les courbes",
    show_total: "Afficher le total du portefeuille",
    show_market_state: "Afficher l'état du marché",
    max_items: "Valeurs affichées en vue compacte",
    zoom: "Bouton détail",
    zoom_helper: "Bascule la mini-carte vers la carte complète et inversement",
    portfolio_section: "Portefeuille (facultatif)",
    quantity: "quantité",
    purchase_price: "prix d'achat",
    currency: "Devise du total du portefeuille",
    currency_helper: "Convertit le total, sa variation du jour et la plus-value. Les taux viennent d'une paire de devises Yahoo Finance (EURUSD=X) s'il y en a une, sinon des capteurs ci-dessous ; une devise sans taux garde son propre total",
    currency_none: "Chaque devise à part (sans conversion)",
    rate: "Taux {from} → {to} (facultatif)",
    no_rate: "pas de taux vers {to}",
    language: "Langue",
    lang_auto: "Automatique",
  },
  de: {
    title_default: "Börse",
    quotes: "Kurse",
    quotes_lc: "Werte",
    quotes_lc_one: "Wert",
    market_open: "Markt geöffnet",
    market_pre: "Vorbörse",
    market_post: "Nachbörse",
    market_closed: "Markt geschlossen",
    portfolio: "Depot",
    today: "heute",
    gain: "Gewinn",
    more: "+{n} weitere",
    unavailable: "Nicht verfügbar",
    no_entities: "Kein Kurs gefunden. Ist die Yahoo-Finance-Integration installiert, oder sind die Preissensoren in der Karte angegeben?",
    unknown_entity: "Entität nicht gefunden",
    sort_by: "Sortieren nach",
    sort_none: "Reihenfolge der Karte",
    sort_name: "Name",
    sort_change: "Veränderung",
    sort_value: "Positionswert",
    period_1d: "24 h",
    period_5d: "5 Tage",
    period_1m: "1 Monat",
    period_3m: "3 Monate",
    period_1y: "1 Jahr",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur Kompaktansicht",
    title: "Titel (optional)",
    url: "Vom Symbol geöffnete URL (optional, standardmäßig Yahoo Finance)",
    entities: "Werte (keine ausgewählt: alle Yahoo-Finance-Sensoren)",
    history_period: "Zeitraum der Kurven",
    change_display: "Angezeigte Veränderung",
    change_both: "Wert und Prozent",
    change_percent: "Prozent",
    change_absolute: "Wert",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    show_name: "Firmennamen anzeigen",
    show_history: "Kurven anzeigen",
    show_total: "Depotsumme anzeigen",
    show_market_state: "Marktstatus anzeigen",
    max_items: "In der Kompaktansicht angezeigte Werte",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltet die Mini-Karte zur vollständigen Karte und zurück",
    portfolio_section: "Depot (optional)",
    quantity: "Stückzahl",
    purchase_price: "Kaufpreis",
    currency: "Währung der Depotsumme",
    currency_helper: "Rechnet die Summe, ihre Tagesveränderung und den Gewinn um. Die Kurse kommen aus einem Yahoo-Finance-Währungspaar (EURUSD=X), falls vorhanden, sonst aus den Sensoren unten; eine Währung ohne Kurs behält ihre eigene Summe",
    currency_none: "Jede Währung getrennt (keine Umrechnung)",
    rate: "Kurs {from} → {to} (optional)",
    no_rate: "kein Kurs nach {to}",
    language: "Sprache",
    lang_auto: "Automatisch",
  },
  es: {
    title_default: "Bolsa",
    quotes: "Cotizaciones",
    quotes_lc: "valores",
    quotes_lc_one: "valor",
    market_open: "Mercado abierto",
    market_pre: "Preapertura",
    market_post: "Después del cierre",
    market_closed: "Mercado cerrado",
    portfolio: "Cartera",
    today: "hoy",
    gain: "Plusvalía",
    more: "+{n} más",
    unavailable: "No disponible",
    no_entities: "No se ha encontrado ninguna cotización. ¿Está instalada la integración Yahoo Finance, o están indicados los sensores de precio en la tarjeta?",
    unknown_entity: "Entidad no encontrada",
    sort_by: "Ordenar por",
    sort_none: "Orden de la tarjeta",
    sort_name: "Nombre",
    sort_change: "Variación",
    sort_value: "Valor de la posición",
    period_1d: "24 h",
    period_5d: "5 días",
    period_1m: "1 mes",
    period_3m: "3 meses",
    period_1y: "1 año",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    title: "Título (opcional)",
    url: "URL abierta por el icono (opcional, Yahoo Finance por defecto)",
    entities: "Valores (ninguno elegido: todos los sensores de Yahoo Finance)",
    history_period: "Periodo de las curvas",
    change_display: "Variación mostrada",
    change_both: "Valor y porcentaje",
    change_percent: "Porcentaje",
    change_absolute: "Valor",
    show_title: "Mostrar el título",
    show_subtitle: "Mostrar el subtítulo",
    show_name: "Mostrar el nombre de las empresas",
    show_history: "Mostrar las curvas",
    show_total: "Mostrar el total de la cartera",
    show_market_state: "Mostrar el estado del mercado",
    max_items: "Valores mostrados en la vista compacta",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta a la tarjeta completa y viceversa",
    portfolio_section: "Cartera (opcional)",
    quantity: "cantidad",
    purchase_price: "precio de compra",
    currency: "Divisa del total de la cartera",
    currency_helper: "Convierte el total, su variación del día y la plusvalía. Los tipos vienen de un par de divisas de Yahoo Finance (EURUSD=X) si lo hay, si no de los sensores de abajo; una divisa sin tipo conserva su propio total",
    currency_none: "Cada divisa por separado (sin conversión)",
    rate: "Tipo {from} → {to} (opcional)",
    no_rate: "sin tipo a {to}",
    language: "Idioma",
    lang_auto: "Automático",
  },
  sr: {
    title_default: "Берза",
    quotes: "Курсеви",
    quotes_lc: "котација",
    quotes_lc_one: "котација",
    quotes_lc_few: "котације",
    market_open: "Тржиште отворено",
    market_pre: "Пре отварања",
    market_post: "После затварања",
    market_closed: "Тржиште затворено",
    portfolio: "Портфолио",
    today: "данас",
    gain: "Добит",
    more: "+{n} још",
    unavailable: "Недоступно",
    no_entities: "Није пронађена ниједна котација. Да ли је инсталирана интеграција Yahoo Finance, или су сензори цена наведени у картици?",
    unknown_entity: "Ентитет није пронађен",
    sort_by: "Сортирај по",
    sort_none: "Редослед картице",
    sort_name: "Назив",
    sort_change: "Промена",
    sort_value: "Вредност позиције",
    period_1d: "24 ч",
    period_5d: "5 дана",
    period_1m: "1 месец",
    period_3m: "3 месеца",
    period_1y: "1 година",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на сажети приказ",
    title: "Наслов (опционо)",
    url: "Адреса коју отвара иконица (опционо, подразумевано Yahoo Finance)",
    entities: "Котације (ниједна изабрана: сви сензори Yahoo Finance)",
    history_period: "Период кривих",
    change_display: "Приказана промена",
    change_both: "Вредност и проценат",
    change_percent: "Проценат",
    change_absolute: "Вредност",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    show_name: "Прикажи називе компанија",
    show_history: "Прикажи криве",
    show_total: "Прикажи укупан портфолио",
    show_market_state: "Прикажи стање тржишта",
    max_items: "Котације у сажетом приказу",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на целу картицу и назад",
    portfolio_section: "Портфолио (опционо)",
    quantity: "количина",
    purchase_price: "набавна цена",
    currency: "Валута укупног портфолија",
    currency_helper: "Претвара укупан износ, његову дневну промену и добит. Курсеви долазе из валутног пара Yahoo Finance (EURUSD=X) ако постоји, иначе из сензора испод; валута без курса задржава свој износ",
    currency_none: "Свака валута посебно (без конверзије)",
    rate: "Курс {from} → {to} (опционо)",
    no_rate: "нема курса за {to}",
    language: "Језик",
    lang_auto: "Аутоматски",
  },
  "sr-Latn": {
    title_default: "Berza",
    quotes: "Kursevi",
    quotes_lc: "kotacija",
    quotes_lc_one: "kotacija",
    quotes_lc_few: "kotacije",
    market_open: "Tržište otvoreno",
    market_pre: "Pre otvaranja",
    market_post: "Posle zatvaranja",
    market_closed: "Tržište zatvoreno",
    portfolio: "Portfolio",
    today: "danas",
    gain: "Dobit",
    more: "+{n} još",
    unavailable: "Nedostupno",
    no_entities: "Nije pronađena nijedna kotacija. Da li je instalirana integracija Yahoo Finance, ili su senzori cena navedeni u kartici?",
    unknown_entity: "Entitet nije pronađen",
    sort_by: "Sortiraj po",
    sort_none: "Redosled kartice",
    sort_name: "Naziv",
    sort_change: "Promena",
    sort_value: "Vrednost pozicije",
    period_1d: "24 h",
    period_5d: "5 dana",
    period_1m: "1 mesec",
    period_3m: "3 meseca",
    period_1y: "1 godina",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na sažeti prikaz",
    title: "Naslov (opciono)",
    url: "Adresa koju otvara ikonica (opciono, podrazumevano Yahoo Finance)",
    entities: "Kotacije (nijedna izabrana: svi senzori Yahoo Finance)",
    history_period: "Period krivih",
    change_display: "Prikazana promena",
    change_both: "Vrednost i procenat",
    change_percent: "Procenat",
    change_absolute: "Vrednost",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_name: "Prikaži nazive kompanija",
    show_history: "Prikaži krive",
    show_total: "Prikaži ukupan portfolio",
    show_market_state: "Prikaži stanje tržišta",
    max_items: "Kotacije u sažetom prikazu",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na celu karticu i nazad",
    portfolio_section: "Portfolio (opciono)",
    quantity: "količina",
    purchase_price: "nabavna cena",
    currency: "Valuta ukupnog portfolija",
    currency_helper: "Pretvara ukupan iznos, njegovu dnevnu promenu i dobit. Kursevi dolaze iz valutnog para Yahoo Finance (EURUSD=X) ako postoji, inače iz senzora ispod; valuta bez kursa zadržava svoj iznos",
    currency_none: "Svaka valuta posebno (bez konverzije)",
    rate: "Kurs {from} → {to} (opciono)",
    no_rate: "nema kursa za {to}",
    language: "Jezik",
    lang_auto: "Automatski",
  },
  it: {
    title_default: "Borsa",
    quotes: "Quotazioni",
    quotes_lc: "titoli",
    quotes_lc_one: "titolo",
    market_open: "Mercato aperto",
    market_pre: "Pre-apertura",
    market_post: "Dopo la chiusura",
    market_closed: "Mercato chiuso",
    portfolio: "Portafoglio",
    today: "oggi",
    gain: "Plusvalenza",
    more: "+{n} altri",
    unavailable: "Non disponibile",
    no_entities: "Nessuna quotazione trovata. L'integrazione Yahoo Finance è installata, oppure i sensori di prezzo sono indicati nella scheda?",
    unknown_entity: "Entità non trovata",
    sort_by: "Ordina per",
    sort_none: "Ordine della scheda",
    sort_name: "Nome",
    sort_change: "Variazione",
    sort_value: "Valore della posizione",
    period_1d: "24 h",
    period_5d: "5 giorni",
    period_1m: "1 mese",
    period_3m: "3 mesi",
    period_1y: "1 anno",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    title: "Titolo (facoltativo)",
    url: "URL aperto dall'icona (facoltativo, Yahoo Finance per impostazione predefinita)",
    entities: "Titoli (nessuno scelto: tutti i sensori Yahoo Finance)",
    history_period: "Periodo delle curve",
    change_display: "Variazione mostrata",
    change_both: "Valore e percentuale",
    change_percent: "Percentuale",
    change_absolute: "Valore",
    show_title: "Mostra il titolo",
    show_subtitle: "Mostra il sottotitolo",
    show_name: "Mostra il nome delle società",
    show_history: "Mostra le curve",
    show_total: "Mostra il totale del portafoglio",
    show_market_state: "Mostra lo stato del mercato",
    max_items: "Titoli mostrati nella vista compatta",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa dalla mini scheda alla scheda completa e viceversa",
    portfolio_section: "Portafoglio (facoltativo)",
    quantity: "quantità",
    purchase_price: "prezzo di acquisto",
    currency: "Valuta del totale del portafoglio",
    currency_helper: "Converte il totale, la sua variazione del giorno e la plusvalenza. I tassi vengono da una coppia di valute Yahoo Finance (EURUSD=X) se c'è, altrimenti dai sensori qui sotto; una valuta senza tasso mantiene il proprio totale",
    currency_none: "Ogni valuta a parte (senza conversione)",
    rate: "Tasso {from} → {to} (facoltativo)",
    no_rate: "nessun tasso verso {to}",
    language: "Lingua",
    lang_auto: "Automatica",
  },
  nl: {
    title_default: "Beurs",
    quotes: "Koersen",
    quotes_lc: "noteringen",
    quotes_lc_one: "notering",
    market_open: "Markt open",
    market_pre: "Voorbeurs",
    market_post: "Nabeurs",
    market_closed: "Markt gesloten",
    portfolio: "Portefeuille",
    today: "vandaag",
    gain: "Winst",
    more: "+{n} meer",
    unavailable: "Niet beschikbaar",
    no_entities: "Geen koers gevonden. Is de Yahoo Finance-integratie geïnstalleerd, of zijn de prijssensoren in de kaart opgegeven?",
    unknown_entity: "Entiteit niet gevonden",
    sort_by: "Sorteren op",
    sort_none: "Volgorde van de kaart",
    sort_name: "Naam",
    sort_change: "Verandering",
    sort_value: "Waarde van de positie",
    period_1d: "24 u",
    period_5d: "5 dagen",
    period_1m: "1 maand",
    period_3m: "3 maanden",
    period_1y: "1 jaar",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    title: "Titel (optioneel)",
    url: "URL geopend door het pictogram (optioneel, standaard Yahoo Finance)",
    entities: "Noteringen (geen gekozen: alle Yahoo Finance-sensoren)",
    history_period: "Periode van de curves",
    change_display: "Getoonde verandering",
    change_both: "Waarde en percentage",
    change_percent: "Percentage",
    change_absolute: "Waarde",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    show_name: "Bedrijfsnamen tonen",
    show_history: "Curves tonen",
    show_total: "Totaal van de portefeuille tonen",
    show_market_state: "Marktstatus tonen",
    max_items: "Noteringen in de compacte weergave",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de volledige kaart en terug",
    portfolio_section: "Portefeuille (optioneel)",
    quantity: "aantal",
    purchase_price: "aankoopprijs",
    currency: "Valuta van het portefeuilletotaal",
    currency_helper: "Rekent het totaal, de dagverandering en de winst om. De koersen komen uit een Yahoo Finance-valutapaar (EURUSD=X) als dat er is, anders uit de sensoren hieronder; een valuta zonder koers houdt haar eigen totaal",
    currency_none: "Elke valuta apart (geen omrekening)",
    rate: "Koers {from} → {to} (optioneel)",
    no_rate: "geen koers naar {to}",
    language: "Taal",
    lang_auto: "Automatisch",
  },
  pt: {
    title_default: "Bolsa",
    quotes: "Cotações",
    quotes_lc: "títulos",
    quotes_lc_one: "título",
    market_open: "Mercado aberto",
    market_pre: "Pré-abertura",
    market_post: "Após o fecho",
    market_closed: "Mercado fechado",
    portfolio: "Carteira",
    today: "hoje",
    gain: "Mais-valia",
    more: "+{n} outros",
    unavailable: "Indisponível",
    no_entities: "Nenhuma cotação encontrada. A integração Yahoo Finance está instalada, ou os sensores de preço estão indicados no cartão?",
    unknown_entity: "Entidade não encontrada",
    sort_by: "Ordenar por",
    sort_none: "Ordem do cartão",
    sort_name: "Nome",
    sort_change: "Variação",
    sort_value: "Valor da posição",
    period_1d: "24 h",
    period_5d: "5 dias",
    period_1m: "1 mês",
    period_3m: "3 meses",
    period_1y: "1 ano",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    title: "Título (opcional)",
    url: "URL aberto pelo ícone (opcional, Yahoo Finance por omissão)",
    entities: "Títulos (nenhum escolhido: todos os sensores Yahoo Finance)",
    history_period: "Período das curvas",
    change_display: "Variação mostrada",
    change_both: "Valor e percentagem",
    change_percent: "Percentagem",
    change_absolute: "Valor",
    show_title: "Mostrar o título",
    show_subtitle: "Mostrar o subtítulo",
    show_name: "Mostrar o nome das empresas",
    show_history: "Mostrar as curvas",
    show_total: "Mostrar o total da carteira",
    show_market_state: "Mostrar o estado do mercado",
    max_items: "Títulos mostrados na vista compacta",
    zoom: "Botão de detalhe",
    zoom_helper: "Alterna o minicartão para o cartão completo e de volta",
    portfolio_section: "Carteira (opcional)",
    quantity: "quantidade",
    purchase_price: "preço de compra",
    currency: "Moeda do total da carteira",
    currency_helper: "Converte o total, a sua variação do dia e a mais-valia. As taxas vêm de um par de moedas do Yahoo Finance (EURUSD=X) se existir, senão dos sensores abaixo; uma moeda sem taxa mantém o seu próprio total",
    currency_none: "Cada moeda à parte (sem conversão)",
    rate: "Taxa {from} → {to} (opcional)",
    no_rate: "sem taxa para {to}",
    language: "Idioma",
    lang_auto: "Automático",
  },
  pl: {
    title_default: "Giełda",
    quotes: "Notowania",
    quotes_lc: "notowania",
    quotes_lc_one: "notowanie",
    quotes_lc_few: "notowania",
    quotes_lc_many: "notowań",
    market_open: "Rynek otwarty",
    market_pre: "Przed otwarciem",
    market_post: "Po zamknięciu",
    market_closed: "Rynek zamknięty",
    portfolio: "Portfel",
    today: "dziś",
    gain: "Zysk",
    more: "+{n} więcej",
    unavailable: "Niedostępne",
    no_entities: "Nie znaleziono notowań. Czy integracja Yahoo Finance jest zainstalowana, albo czy czujniki cen są podane w karcie?",
    unknown_entity: "Nie znaleziono encji",
    sort_by: "Sortuj według",
    sort_none: "Kolejność karty",
    sort_name: "Nazwa",
    sort_change: "Zmiana",
    sort_value: "Wartość pozycji",
    period_1d: "24 h",
    period_5d: "5 dni",
    period_1m: "1 miesiąc",
    period_3m: "3 miesiące",
    period_1y: "1 rok",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    title: "Tytuł (opcjonalnie)",
    url: "Adres URL otwierany przez ikonę (opcjonalnie, domyślnie Yahoo Finance)",
    entities: "Notowania (brak wyboru: wszystkie czujniki Yahoo Finance)",
    history_period: "Okres wykresów",
    change_display: "Wyświetlana zmiana",
    change_both: "Wartość i procent",
    change_percent: "Procent",
    change_absolute: "Wartość",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    show_name: "Pokaż nazwy spółek",
    show_history: "Pokaż wykresy",
    show_total: "Pokaż sumę portfela",
    show_market_state: "Pokaż stan rynku",
    max_items: "Notowania w widoku kompaktowym",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na pełną kartę i z powrotem",
    portfolio_section: "Portfel (opcjonalnie)",
    quantity: "liczba",
    purchase_price: "cena zakupu",
    currency: "Waluta sumy portfela",
    currency_helper: "Przelicza sumę, jej dzienną zmianę i zysk. Kursy pochodzą z pary walutowej Yahoo Finance (EURUSD=X), jeśli istnieje, w przeciwnym razie z czujników poniżej; waluta bez kursu zachowuje własną sumę",
    currency_none: "Każda waluta osobno (bez przeliczania)",
    rate: "Kurs {from} → {to} (opcjonalnie)",
    no_rate: "brak kursu do {to}",
    language: "Język",
    lang_auto: "Automatycznie",
  },
  ro: {
    title_default: "Bursă",
    quotes: "Cotații",
    quotes_lc: "de cotații",
    quotes_lc_one: "cotație",
    quotes_lc_few: "cotații",
    market_open: "Piață deschisă",
    market_pre: "Înainte de deschidere",
    market_post: "După închidere",
    market_closed: "Piață închisă",
    portfolio: "Portofoliu",
    today: "azi",
    gain: "Câștig",
    more: "+{n} în plus",
    unavailable: "Indisponibil",
    no_entities: "Nicio cotație găsită. Este instalată integrarea Yahoo Finance sau sunt indicați senzorii de preț în card?",
    unknown_entity: "Entitate negăsită",
    sort_by: "Sortează după",
    sort_none: "Ordinea cardului",
    sort_name: "Nume",
    sort_change: "Variație",
    sort_value: "Valoarea poziției",
    period_1d: "24 h",
    period_5d: "5 zile",
    period_1m: "1 lună",
    period_3m: "3 luni",
    period_1y: "1 an",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    title: "Titlu (opțional)",
    url: "URL deschis de pictogramă (opțional, implicit Yahoo Finance)",
    entities: "Cotații (niciuna aleasă: toți senzorii Yahoo Finance)",
    history_period: "Perioada curbelor",
    change_display: "Variația afișată",
    change_both: "Valoare și procent",
    change_percent: "Procent",
    change_absolute: "Valoare",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    show_name: "Afișează numele companiilor",
    show_history: "Afișează curbele",
    show_total: "Afișează totalul portofoliului",
    show_market_state: "Afișează starea pieței",
    max_items: "Cotații afișate în vizualizarea compactă",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini-cardul la cardul complet și înapoi",
    portfolio_section: "Portofoliu (opțional)",
    quantity: "cantitate",
    purchase_price: "preț de achiziție",
    currency: "Moneda totalului portofoliului",
    currency_helper: "Convertește totalul, variația sa zilnică și câștigul. Cursurile vin dintr-o pereche valutară Yahoo Finance (EURUSD=X) dacă există, altfel din senzorii de mai jos; o monedă fără curs își păstrează propriul total",
    currency_none: "Fiecare monedă separat (fără conversie)",
    rate: "Curs {from} → {to} (opțional)",
    no_rate: "niciun curs către {to}",
    language: "Limbă",
    lang_auto: "Automat",
  },
  da: {
    title_default: "Børs",
    quotes: "Kurser",
    quotes_lc: "kurser",
    quotes_lc_one: "kurs",
    market_open: "Markedet er åbent",
    market_pre: "Før åbning",
    market_post: "Efter lukning",
    market_closed: "Markedet er lukket",
    portfolio: "Portefølje",
    today: "i dag",
    gain: "Gevinst",
    more: "+{n} mere",
    unavailable: "Utilgængelig",
    no_entities: "Ingen kurs fundet. Er Yahoo Finance-integrationen installeret, eller er prissensorerne angivet i kortet?",
    unknown_entity: "Enhed ikke fundet",
    sort_by: "Sortér efter",
    sort_none: "Kortets rækkefølge",
    sort_name: "Navn",
    sort_change: "Ændring",
    sort_value: "Positionens værdi",
    period_1d: "24 t",
    period_5d: "5 dage",
    period_1m: "1 måned",
    period_3m: "3 måneder",
    period_1y: "1 år",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til kompakt visning",
    title: "Titel (valgfri)",
    url: "URL åbnet af ikonet (valgfri, Yahoo Finance som standard)",
    entities: "Kurser (ingen valgt: alle Yahoo Finance-sensorer)",
    history_period: "Kurvernes periode",
    change_display: "Vist ændring",
    change_both: "Værdi og procent",
    change_percent: "Procent",
    change_absolute: "Værdi",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    show_name: "Vis virksomhedernes navne",
    show_history: "Vis kurver",
    show_total: "Vis porteføljens total",
    show_market_state: "Vis markedets status",
    max_items: "Kurser vist i kompakt visning",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til hele kortet og tilbage",
    portfolio_section: "Portefølje (valgfri)",
    quantity: "antal",
    purchase_price: "købspris",
    currency: "Valuta for porteføljens total",
    currency_helper: "Omregner totalen, dens daglige ændring og gevinsten. Kurserne kommer fra et Yahoo Finance-valutapar (EURUSD=X), hvis der er et, ellers fra sensorerne nedenfor; en valuta uden kurs beholder sin egen total",
    currency_none: "Hver valuta for sig (ingen omregning)",
    rate: "Kurs {from} → {to} (valgfri)",
    no_rate: "ingen kurs til {to}",
    language: "Sprog",
    lang_auto: "Automatisk",
  },
  sv: {
    title_default: "Börs",
    quotes: "Kurser",
    quotes_lc: "kurser",
    quotes_lc_one: "kurs",
    market_open: "Marknaden är öppen",
    market_pre: "Före öppning",
    market_post: "Efter stängning",
    market_closed: "Marknaden är stängd",
    portfolio: "Portfölj",
    today: "i dag",
    gain: "Vinst",
    more: "+{n} till",
    unavailable: "Inte tillgänglig",
    no_entities: "Ingen kurs hittades. Är Yahoo Finance-integrationen installerad, eller anges prissensorerna i kortet?",
    unknown_entity: "Entiteten hittades inte",
    sort_by: "Sortera efter",
    sort_none: "Kortets ordning",
    sort_name: "Namn",
    sort_change: "Förändring",
    sort_value: "Positionens värde",
    period_1d: "24 h",
    period_5d: "5 dagar",
    period_1m: "1 månad",
    period_3m: "3 månader",
    period_1y: "1 år",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    title: "Titel (valfri)",
    url: "URL som öppnas av ikonen (valfri, Yahoo Finance som standard)",
    entities: "Kurser (inga valda: alla Yahoo Finance-sensorer)",
    history_period: "Kurvornas period",
    change_display: "Visad förändring",
    change_both: "Värde och procent",
    change_percent: "Procent",
    change_absolute: "Värde",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    show_name: "Visa företagens namn",
    show_history: "Visa kurvor",
    show_total: "Visa portföljens totalvärde",
    show_market_state: "Visa marknadens status",
    max_items: "Kurser som visas i kompakt vy",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortet och tillbaka",
    portfolio_section: "Portfölj (valfri)",
    quantity: "antal",
    purchase_price: "inköpspris",
    currency: "Valuta för portföljens totalvärde",
    currency_helper: "Räknar om totalvärdet, dagens förändring och vinsten. Kurserna kommer från ett valutapar i Yahoo Finance (EURUSD=X) om det finns, annars från sensorerna nedan; en valuta utan kurs behåller sitt eget totalvärde",
    currency_none: "Varje valuta för sig (ingen omräkning)",
    rate: "Kurs {from} → {to} (valfri)",
    no_rate: "ingen kurs till {to}",
    language: "Språk",
    lang_auto: "Automatiskt",
  },
  bg: {
    title_default: "Борса",
    quotes: "Котировки",
    quotes_lc: "котировки",
    quotes_lc_one: "котировка",
    market_open: "Пазарът е отворен",
    market_pre: "Преди отваряне",
    market_post: "След затваряне",
    market_closed: "Пазарът е затворен",
    portfolio: "Портфейл",
    today: "днес",
    gain: "Печалба",
    more: "+{n} още",
    unavailable: "Недостъпно",
    no_entities: "Не е намерена котировка. Инсталирана ли е интеграцията Yahoo Finance, или сензорите за цени посочени ли са в картата?",
    unknown_entity: "Обектът не е намерен",
    sort_by: "Сортиране по",
    sort_none: "Ред на картата",
    sort_name: "Име",
    sort_change: "Промяна",
    sort_value: "Стойност на позицията",
    period_1d: "24 ч",
    period_5d: "5 дни",
    period_1m: "1 месец",
    period_3m: "3 месеца",
    period_1y: "1 година",
    zoom_in: "Покажи цялата карта",
    zoom_out: "Обратно към компактния изглед",
    title: "Заглавие (по избор)",
    url: "URL, отварян от иконата (по избор, по подразбиране Yahoo Finance)",
    entities: "Котировки (без избор: всички сензори на Yahoo Finance)",
    history_period: "Период на кривите",
    change_display: "Показана промяна",
    change_both: "Стойност и процент",
    change_percent: "Процент",
    change_absolute: "Стойност",
    show_title: "Покажи заглавието",
    show_subtitle: "Покажи подзаглавието",
    show_name: "Покажи имената на компаниите",
    show_history: "Покажи кривите",
    show_total: "Покажи общата стойност на портфейла",
    show_market_state: "Покажи състоянието на пазара",
    max_items: "Котировки в компактния изглед",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към цялата карта и обратно",
    portfolio_section: "Портфейл (по избор)",
    quantity: "количество",
    purchase_price: "покупна цена",
    currency: "Валута на общата стойност на портфейла",
    currency_helper: "Преизчислява общата стойност, дневната ѝ промяна и печалбата. Курсовете идват от валутна двойка в Yahoo Finance (EURUSD=X), ако има такава, иначе от сензорите по-долу; валута без курс запазва собствената си обща стойност",
    currency_none: "Всяка валута поотделно (без преизчисляване)",
    rate: "Курс {from} → {to} (по избор)",
    no_rate: "няма курс към {to}",
    language: "Език",
    lang_auto: "Автоматично",
  },
  ru: {
    title_default: "Биржа",
    quotes: "Котировки",
    quotes_lc: "котировки",
    quotes_lc_one: "котировка",
    quotes_lc_few: "котировки",
    quotes_lc_many: "котировок",
    market_open: "Рынок открыт",
    market_pre: "До открытия",
    market_post: "После закрытия",
    market_closed: "Рынок закрыт",
    portfolio: "Портфель",
    today: "сегодня",
    gain: "Прибыль",
    more: "+{n} ещё",
    unavailable: "Недоступно",
    no_entities: "Котировки не найдены. Установлена ли интеграция Yahoo Finance, или указаны ли датчики цен в карточке?",
    unknown_entity: "Объект не найден",
    sort_by: "Сортировать по",
    sort_none: "Порядок карточки",
    sort_name: "Название",
    sort_change: "Изменение",
    sort_value: "Стоимость позиции",
    period_1d: "24 ч",
    period_5d: "5 дней",
    period_1m: "1 месяц",
    period_3m: "3 месяца",
    period_1y: "1 год",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    title: "Заголовок (необязательно)",
    url: "URL, открываемый значком (необязательно, по умолчанию Yahoo Finance)",
    entities: "Котировки (ничего не выбрано: все датчики Yahoo Finance)",
    history_period: "Период графиков",
    change_display: "Показываемое изменение",
    change_both: "Значение и процент",
    change_percent: "Процент",
    change_absolute: "Значение",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    show_name: "Показывать названия компаний",
    show_history: "Показывать графики",
    show_total: "Показывать итог портфеля",
    show_market_state: "Показывать состояние рынка",
    max_items: "Котировки в компактном виде",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на полную карточку и обратно",
    portfolio_section: "Портфель (необязательно)",
    quantity: "количество",
    purchase_price: "цена покупки",
    currency: "Валюта итога портфеля",
    currency_helper: "Пересчитывает итог, его дневное изменение и прибыль. Курсы берутся из валютной пары Yahoo Finance (EURUSD=X), если она есть, иначе из датчиков ниже; валюта без курса сохраняет собственный итог",
    currency_none: "Каждая валюта отдельно (без пересчёта)",
    rate: "Курс {from} → {to} (необязательно)",
    no_rate: "нет курса к {to}",
    language: "Язык",
    lang_auto: "Автоматически",
  },
  uk: {
    title_default: "Біржа",
    quotes: "Котирування",
    quotes_lc: "котирування",
    quotes_lc_one: "котирування",
    quotes_lc_few: "котирування",
    quotes_lc_many: "котирувань",
    market_open: "Ринок відкритий",
    market_pre: "До відкриття",
    market_post: "Після закриття",
    market_closed: "Ринок закритий",
    portfolio: "Портфель",
    today: "сьогодні",
    gain: "Прибуток",
    more: "+{n} ще",
    unavailable: "Недоступно",
    no_entities: "Котирувань не знайдено. Чи встановлено інтеграцію Yahoo Finance, або чи вказано датчики цін у картці?",
    unknown_entity: "Об'єкт не знайдено",
    sort_by: "Сортувати за",
    sort_none: "Порядок картки",
    sort_name: "Назва",
    sort_change: "Зміна",
    sort_value: "Вартість позиції",
    period_1d: "24 год",
    period_5d: "5 днів",
    period_1m: "1 місяць",
    period_3m: "3 місяці",
    period_1y: "1 рік",
    zoom_in: "Показати повну картку",
    zoom_out: "Повернутися до компактного вигляду",
    title: "Заголовок (необов'язково)",
    url: "URL, що відкривається значком (необов'язково, типово Yahoo Finance)",
    entities: "Котирування (нічого не вибрано: усі датчики Yahoo Finance)",
    history_period: "Період графіків",
    change_display: "Показувана зміна",
    change_both: "Значення і відсоток",
    change_percent: "Відсоток",
    change_absolute: "Значення",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    show_name: "Показувати назви компаній",
    show_history: "Показувати графіки",
    show_total: "Показувати підсумок портфеля",
    show_market_state: "Показувати стан ринку",
    max_items: "Котирування в компактному вигляді",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає міні-картку на повну картку і назад",
    portfolio_section: "Портфель (необов'язково)",
    quantity: "кількість",
    purchase_price: "ціна купівлі",
    currency: "Валюта підсумку портфеля",
    currency_helper: "Перераховує підсумок, його денну зміну та прибуток. Курси беруться з валютної пари Yahoo Finance (EURUSD=X), якщо вона є, інакше з датчиків нижче; валюта без курсу зберігає власний підсумок",
    currency_none: "Кожна валюта окремо (без перерахунку)",
    rate: "Курс {from} → {to} (необов'язково)",
    no_rate: "немає курсу до {to}",
    language: "Мова",
    lang_auto: "Автоматично",
  },
  hu: {
    title_default: "Tőzsde",
    quotes: "Árfolyamok",
    quotes_lc: "árfolyam",
    quotes_lc_one: "árfolyam",
    market_open: "Piac nyitva",
    market_pre: "Nyitás előtt",
    market_post: "Zárás után",
    market_closed: "Piac zárva",
    portfolio: "Portfólió",
    today: "ma",
    gain: "Nyereség",
    more: "+{n} további",
    unavailable: "Nem elérhető",
    no_entities: "Nem található árfolyam. Telepítve van a Yahoo Finance integráció, vagy meg vannak adva az árérzékelők a kártyán?",
    unknown_entity: "Az entitás nem található",
    sort_by: "Rendezés",
    sort_none: "Kártya sorrendje",
    sort_name: "Név",
    sort_change: "Változás",
    sort_value: "Pozíció értéke",
    period_1d: "24 ó",
    period_5d: "5 nap",
    period_1m: "1 hónap",
    period_3m: "3 hónap",
    period_1y: "1 év",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    title: "Cím (nem kötelező)",
    url: "Az ikon által megnyitott URL (nem kötelező, alapértelmezés: Yahoo Finance)",
    entities: "Árfolyamok (nincs kiválasztva: minden Yahoo Finance érzékelő)",
    history_period: "Görbék időszaka",
    change_display: "Megjelenített változás",
    change_both: "Érték és százalék",
    change_percent: "Százalék",
    change_absolute: "Érték",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    show_name: "Cégnevek megjelenítése",
    show_history: "Görbék megjelenítése",
    show_total: "Portfólió összértékének megjelenítése",
    show_market_state: "Piac állapotának megjelenítése",
    max_items: "Kompakt nézetben megjelenített árfolyamok",
    zoom: "Részletek gomb",
    zoom_helper: "A mini kártyát a teljes kártyára váltja és vissza",
    portfolio_section: "Portfólió (nem kötelező)",
    quantity: "mennyiség",
    purchase_price: "vételár",
    currency: "A portfólió összesítőjének pénzneme",
    currency_helper: "Átváltja az összesítőt, a napi változását és a nyereséget. Az árfolyamok egy Yahoo Finance devizapárból (EURUSD=X) jönnek, ha van ilyen, különben az alábbi érzékelőkből; az árfolyam nélküli pénznem megtartja a saját összesítőjét",
    currency_none: "Minden pénznem külön (átváltás nélkül)",
    rate: "{from} → {to} árfolyam (opcionális)",
    no_rate: "nincs árfolyam erre: {to}",
    language: "Nyelv",
    lang_auto: "Automatikus",
  },
  sk: {
    title_default: "Burza",
    quotes: "Kurzy",
    quotes_lc: "kurzov",
    quotes_lc_one: "kurz",
    quotes_lc_few: "kurzy",
    market_open: "Trh otvorený",
    market_pre: "Pred otvorením",
    market_post: "Po zatvorení",
    market_closed: "Trh zatvorený",
    portfolio: "Portfólio",
    today: "dnes",
    gain: "Zisk",
    more: "+{n} ďalších",
    unavailable: "Nedostupné",
    no_entities: "Nenašiel sa žiadny kurz. Je nainštalovaná integrácia Yahoo Finance, alebo sú senzory cien uvedené v karte?",
    unknown_entity: "Entita sa nenašla",
    sort_by: "Zoradiť podľa",
    sort_none: "Poradie karty",
    sort_name: "Názov",
    sort_change: "Zmena",
    sort_value: "Hodnota pozície",
    period_1d: "24 h",
    period_5d: "5 dní",
    period_1m: "1 mesiac",
    period_3m: "3 mesiace",
    period_1y: "1 rok",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    title: "Názov (voliteľný)",
    url: "URL otvorená ikonou (voliteľná, predvolene Yahoo Finance)",
    entities: "Kurzy (nič nevybrané: všetky senzory Yahoo Finance)",
    history_period: "Obdobie kriviek",
    change_display: "Zobrazená zmena",
    change_both: "Hodnota a percento",
    change_percent: "Percento",
    change_absolute: "Hodnota",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    show_name: "Zobraziť názvy spoločností",
    show_history: "Zobraziť krivky",
    show_total: "Zobraziť súčet portfólia",
    show_market_state: "Zobraziť stav trhu",
    max_items: "Kurzy v kompaktnom zobrazení",
    zoom: "Tlačidlo detailu",
    zoom_helper: "Prepne minikartu na celú kartu a späť",
    portfolio_section: "Portfólio (voliteľné)",
    quantity: "počet",
    purchase_price: "nákupná cena",
    currency: "Mena súčtu portfólia",
    currency_helper: "Prepočíta súčet, jeho dennú zmenu a zisk. Kurzy pochádzajú z menového páru Yahoo Finance (EURUSD=X), ak existuje, inak zo snímačov nižšie; mena bez kurzu si ponechá vlastný súčet",
    currency_none: "Každá mena zvlášť (bez prepočtu)",
    rate: "Kurz {from} → {to} (voliteľné)",
    no_rate: "žiadny kurz na {to}",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  cs: {
    title_default: "Burza",
    quotes: "Kurzy",
    quotes_lc: "kurzů",
    quotes_lc_one: "kurz",
    quotes_lc_few: "kurzy",
    market_open: "Trh otevřen",
    market_pre: "Před otevřením",
    market_post: "Po uzavření",
    market_closed: "Trh uzavřen",
    portfolio: "Portfolio",
    today: "dnes",
    gain: "Zisk",
    more: "+{n} další",
    unavailable: "Nedostupné",
    no_entities: "Nebyl nalezen žádný kurz. Je nainstalována integrace Yahoo Finance, nebo jsou senzory cen uvedeny v kartě?",
    unknown_entity: "Entita nenalezena",
    sort_by: "Řadit podle",
    sort_none: "Pořadí karty",
    sort_name: "Název",
    sort_change: "Změna",
    sort_value: "Hodnota pozice",
    period_1d: "24 h",
    period_5d: "5 dní",
    period_1m: "1 měsíc",
    period_3m: "3 měsíce",
    period_1y: "1 rok",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    title: "Název (volitelný)",
    url: "URL otevřená ikonou (volitelná, výchozí Yahoo Finance)",
    entities: "Kurzy (nic nevybráno: všechny senzory Yahoo Finance)",
    history_period: "Období křivek",
    change_display: "Zobrazená změna",
    change_both: "Hodnota a procento",
    change_percent: "Procento",
    change_absolute: "Hodnota",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    show_name: "Zobrazit názvy společností",
    show_history: "Zobrazit křivky",
    show_total: "Zobrazit součet portfolia",
    show_market_state: "Zobrazit stav trhu",
    max_items: "Kurzy v kompaktním zobrazení",
    zoom: "Tlačítko detailu",
    zoom_helper: "Přepne minikartu na celou kartu a zpět",
    portfolio_section: "Portfolio (volitelné)",
    quantity: "počet",
    purchase_price: "nákupní cena",
    currency: "Měna součtu portfolia",
    currency_helper: "Přepočítá součet, jeho denní změnu a zisk. Kurzy pocházejí z měnového páru Yahoo Finance (EURUSD=X), pokud existuje, jinak ze senzorů níže; měna bez kurzu si ponechá vlastní součet",
    currency_none: "Každá měna zvlášť (bez přepočtu)",
    rate: "Kurz {from} → {to} (volitelné)",
    no_rate: "žádný kurz na {to}",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  sl: {
    title_default: "Borza",
    quotes: "Tečaji",
    quotes_lc: "tečajev",
    quotes_lc_one: "tečaj",
    quotes_lc_two: "tečaja",
    quotes_lc_few: "tečaji",
    market_open: "Trg odprt",
    market_pre: "Pred odprtjem",
    market_post: "Po zaprtju",
    market_closed: "Trg zaprt",
    portfolio: "Portfelj",
    today: "danes",
    gain: "Dobiček",
    more: "+{n} več",
    unavailable: "Ni na voljo",
    no_entities: "Ni najdenega tečaja. Ali je integracija Yahoo Finance nameščena, ali pa so senzorji cen navedeni v kartici?",
    unknown_entity: "Entiteta ni najdena",
    sort_by: "Razvrsti po",
    sort_none: "Vrstni red kartice",
    sort_name: "Ime",
    sort_change: "Sprememba",
    sort_value: "Vrednost pozicije",
    period_1d: "24 h",
    period_5d: "5 dni",
    period_1m: "1 mesec",
    period_3m: "3 meseci",
    period_1y: "1 leto",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen pogled",
    title: "Naslov (neobvezno)",
    url: "URL, ki ga odpre ikona (neobvezno, privzeto Yahoo Finance)",
    entities: "Tečaji (nič izbrano: vsi senzorji Yahoo Finance)",
    history_period: "Obdobje krivulj",
    change_display: "Prikazana sprememba",
    change_both: "Vrednost in odstotek",
    change_percent: "Odstotek",
    change_absolute: "Vrednost",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_name: "Prikaži imena podjetij",
    show_history: "Prikaži krivulje",
    show_total: "Prikaži skupno vrednost portfelja",
    show_market_state: "Prikaži stanje trga",
    max_items: "Tečaji v strnjenem pogledu",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na celotno kartico in nazaj",
    portfolio_section: "Portfelj (neobvezno)",
    quantity: "količina",
    purchase_price: "nakupna cena",
    currency: "Valuta skupne vrednosti portfelja",
    currency_helper: "Preračuna skupno vrednost, njeno dnevno spremembo in dobiček. Tečaji prihajajo iz valutnega para Yahoo Finance (EURUSD=X), če obstaja, sicer iz spodnjih senzorjev; valuta brez tečaja ohrani svojo skupno vrednost",
    currency_none: "Vsaka valuta posebej (brez preračuna)",
    rate: "Tečaj {from} → {to} (neobvezno)",
    no_rate: "ni tečaja v {to}",
    language: "Jezik",
    lang_auto: "Samodejno",
  },
  lv: {
    title_default: "Birža",
    quotes: "Kotācijas",
    quotes_lc: "kotācijas",
    quotes_lc_zero: "kotāciju",
    quotes_lc_one: "kotācija",
    market_open: "Tirgus atvērts",
    market_pre: "Pirms atvēršanas",
    market_post: "Pēc slēgšanas",
    market_closed: "Tirgus slēgts",
    portfolio: "Portfelis",
    today: "šodien",
    gain: "Peļņa",
    more: "+{n} vēl",
    unavailable: "Nav pieejams",
    no_entities: "Nav atrasta neviena kotācija. Vai Yahoo Finance integrācija ir instalēta, vai cenu sensori ir norādīti kartītē?",
    unknown_entity: "Vienība nav atrasta",
    sort_by: "Kārtot pēc",
    sort_none: "Kartītes secība",
    sort_name: "Nosaukums",
    sort_change: "Izmaiņa",
    sort_value: "Pozīcijas vērtība",
    period_1d: "24 h",
    period_5d: "5 dienas",
    period_1m: "1 mēnesis",
    period_3m: "3 mēneši",
    period_1y: "1 gads",
    zoom_in: "Rādīt pilno kartīti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    title: "Virsraksts (neobligāts)",
    url: "URL, ko atver ikona (neobligāts, pēc noklusējuma Yahoo Finance)",
    entities: "Kotācijas (nekas nav izvēlēts: visi Yahoo Finance sensori)",
    history_period: "Līkņu periods",
    change_display: "Rādītā izmaiņa",
    change_both: "Vērtība un procenti",
    change_percent: "Procenti",
    change_absolute: "Vērtība",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    show_name: "Rādīt uzņēmumu nosaukumus",
    show_history: "Rādīt līknes",
    show_total: "Rādīt portfeļa kopsummu",
    show_market_state: "Rādīt tirgus stāvokli",
    max_items: "Kompaktajā skatā rādītās kotācijas",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilno kartīti un atpakaļ",
    portfolio_section: "Portfelis (neobligāts)",
    quantity: "daudzums",
    purchase_price: "iegādes cena",
    currency: "Portfeļa kopsummas valūta",
    currency_helper: "Pārrēķina kopsummu, tās dienas izmaiņas un peļņu. Kursi tiek ņemti no Yahoo Finance valūtu pāra (EURUSD=X), ja tāds ir, citādi no zemāk norādītajiem sensoriem; valūta bez kursa saglabā savu kopsummu",
    currency_none: "Katra valūta atsevišķi (bez pārrēķina)",
    rate: "Kurss {from} → {to} (neobligāts)",
    no_rate: "nav kursa uz {to}",
    language: "Valoda",
    lang_auto: "Automātiski",
  },
  el: {
    title_default: "Χρηματιστήριο",
    quotes: "Τιμές",
    quotes_lc: "μετοχές",
    quotes_lc_one: "μετοχή",
    market_open: "Αγορά ανοιχτή",
    market_pre: "Πριν το άνοιγμα",
    market_post: "Μετά το κλείσιμο",
    market_closed: "Αγορά κλειστή",
    portfolio: "Χαρτοφυλάκιο",
    today: "σήμερα",
    gain: "Κέρδος",
    more: "+{n} ακόμη",
    unavailable: "Μη διαθέσιμο",
    no_entities: "Δεν βρέθηκε καμία τιμή. Είναι εγκατεστημένη η ενσωμάτωση Yahoo Finance ή έχουν οριστεί οι αισθητήρες τιμών στην κάρτα;",
    unknown_entity: "Η οντότητα δεν βρέθηκε",
    sort_by: "Ταξινόμηση κατά",
    sort_none: "Σειρά της κάρτας",
    sort_name: "Όνομα",
    sort_change: "Μεταβολή",
    sort_value: "Αξία θέσης",
    period_1d: "24 ώ",
    period_5d: "5 ημέρες",
    period_1m: "1 μήνας",
    period_3m: "3 μήνες",
    period_1y: "1 έτος",
    zoom_in: "Εμφάνιση πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    title: "Τίτλος (προαιρετικός)",
    url: "URL που ανοίγει το εικονίδιο (προαιρετικό, προεπιλογή Yahoo Finance)",
    entities: "Μετοχές (καμία επιλογή: όλοι οι αισθητήρες Yahoo Finance)",
    history_period: "Περίοδος καμπυλών",
    change_display: "Εμφανιζόμενη μεταβολή",
    change_both: "Τιμή και ποσοστό",
    change_percent: "Ποσοστό",
    change_absolute: "Τιμή",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    show_name: "Εμφάνιση ονομάτων εταιρειών",
    show_history: "Εμφάνιση καμπυλών",
    show_total: "Εμφάνιση συνόλου χαρτοφυλακίου",
    show_market_state: "Εμφάνιση κατάστασης αγοράς",
    max_items: "Μετοχές στη συμπαγή προβολή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Εναλλάσσει τη μίνι κάρτα με την πλήρη κάρτα",
    portfolio_section: "Χαρτοφυλάκιο (προαιρετικό)",
    quantity: "ποσότητα",
    purchase_price: "τιμή αγοράς",
    currency: "Νόμισμα του συνόλου του χαρτοφυλακίου",
    currency_helper: "Μετατρέπει το σύνολο, τη μεταβολή της ημέρας και το κέρδος. Οι ισοτιμίες προέρχονται από ένα ζεύγος νομισμάτων του Yahoo Finance (EURUSD=X), αν υπάρχει, αλλιώς από τους αισθητήρες παρακάτω· ένα νόμισμα χωρίς ισοτιμία διατηρεί το δικό του σύνολο",
    currency_none: "Κάθε νόμισμα χωριστά (χωρίς μετατροπή)",
    rate: "Ισοτιμία {from} → {to} (προαιρετικό)",
    no_rate: "καμία ισοτιμία προς {to}",
    language: "Γλώσσα",
    lang_auto: "Αυτόματη",
  },
};

const LANG_OPTIONS = [
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

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Locale of the numbers: Home Assistant's own language when its base matches the card's language
// (keeps the region, e.g. de-CH or fr-CA), otherwise the card's language. Home Assistant's "pt" is
// European Portuguese, which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

// Plural rules of a dictionary: pt is European Portuguese, where 0 takes the plural (Intl's "pt" is Brazilian).
const pluralLocale = (code) => (code === "pt" ? "pt-PT" : code);

// Counted noun ("4 quotes"): the language's Intl.PluralRules form (key_one, key_few, key_many…) when the
// dictionary has it, else the key itself.
const tn = (hass, config, key, n) => {
  const code = lang(hass, config);
  const v = Number(n);
  if (Number.isFinite(v)) {
    const form = STRINGS[code][`${key}_${new Intl.PluralRules(pluralLocale(code)).select(v)}`];
    if (form) return form;
  }
  return t(hass, config, key);
};

const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// Number formats are cached: Intl.NumberFormat is slow to build and a card formats a few dozen numbers per render.
const _formats = new Map();
const nf = (locale, opts) => {
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
const isIso = (unit) => /^[A-Z]{3}$/.test(unit || "");

// Decimals of a price: the `decimals` option, else 2, and 4 under 1 (a penny stock or a currency rate).
const priceDecimals = (v, decimals) => (Number.isInteger(decimals) ? decimals : Math.abs(v) < 1 && v !== 0 ? 4 : 2);

const fmtMoney = (v, unit, locale, { decimals, sign = false } = {}) => {
  if (v === null) return "—";
  const d = priceDecimals(v, decimals);
  const opts = { minimumFractionDigits: d, maximumFractionDigits: d, ...(sign ? { signDisplay: "exceptZero" } : {}) };
  if (isIso(unit)) return nf(locale, { ...opts, style: "currency", currency: unit, currencyDisplay: "narrowSymbol" }).format(v);
  const n = nf(locale, opts).format(v);
  return unit ? `${n} ${unit}` : n;
};

// "+1.23%" in the card's locale ("+1,23 %" in French).
const fmtPct = (v, locale, sign = true) =>
  v === null
    ? "—"
    : nf(locale, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, ...(sign ? { signDisplay: "exceptZero" } : {}) }).format(v / 100);

// Class of a change: up (green), down (red), flat or unknown (grey).
const trend = (v) => (v === null || v === undefined ? "idle" : v > 0 ? "up" : v < 0 ? "down" : "flat");

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

// Same values, compared by identity: used to skip a render when nothing the card shows has changed.
const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML (as in the other ha-* cards): nodes whose tag is unchanged are
// kept, so keyboard focus, hover and CSS animations survive an update. Rows carry a data-key (their entity id) and
// are matched by it wherever a new sort moved them; nodes without a data-key are matched by position.
const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
const patchChildren = (cur, next) => {
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
const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------

// A Yahoo Finance sensor: its registry platform, else its quote attributes (YAML sensors may have no registry entry).
const isYahoo = (hass, id) => {
  if (!id.startsWith("sensor.")) return false;
  if (hass.entities?.[id]?.platform === "yahoofinance") return true;
  const a = hass.states[id]?.attributes;
  return !!a && typeof a.symbol === "string" && ("regularMarketPrice" in a || "regularMarketChange" in a);
};

// The Yahoo Finance sensors of Home Assistant, by entity id.
const yahooEntities = (hass) =>
  Object.keys(hass.states || {})
    .filter((id) => isYahoo(hass, id))
    .sort();

// The configured quotes: `entities` (entity ids, or objects with entity, name, quantity, purchase_price),
// else every Yahoo Finance sensor. Duplicates are kept once.
const quoteConfigs = (hass, config) => {
  const list = Array.isArray(config.entities) && config.entities.length ? config.entities : yahooEntities(hass);
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const c = typeof item === "string" ? { entity: item } : item && typeof item === "object" ? { ...item } : null;
    if (!c?.entity || seen.has(c.entity)) continue;
    seen.add(c.entity);
    out.push(c);
  }
  return out;
};

const MARKET_STATES = { REGULAR: "open", PRE: "pre", PREPRE: "pre", POST: "post", POSTPOST: "post", CLOSED: "closed" };

// Everything a row shows, from a sensor and its configuration. `hist` (optional): its points over the period,
// used for the change of a sensor that gives none (anything but Yahoo Finance).
const quoteOf = (hass, c, hist) => {
  const s = hass.states[c.entity];
  if (!s) return { id: c.entity, missing: true, name: c.name || c.entity };
  const a = s.attributes || {};
  const yahoo = isYahoo(hass, c.entity);
  const price = num(s.state) ?? num(a.regularMarketPrice);
  const unit = a.unit_of_measurement || a.currency || a.currencySymbol || "";
  let change = num(a.regularMarketChange ?? a.change);
  let pct = num(a.regularMarketChangePercent ?? a.change_percent ?? a.changePercent);
  const prev = num(a.regularMarketPreviousClose ?? a.previous_close);
  // Previous close known: the change follows the live price (the state may be newer than the change attributes).
  if (prev && price !== null && change === null) change = price - prev;
  if (change !== null && pct === null && price !== null && price - change) pct = (100 * change) / (price - change);
  // No change of the day: the change over the sparkline's period, from its first point.
  let periodic = false;
  if (change === null && price !== null && hist?.length) {
    const first = hist[0].v;
    change = price - first;
    pct = first ? (100 * change) / first : null;
    periodic = true;
  }
  const symbol = a.symbol || (yahoo ? c.entity.replace(/^sensor\.yahoofinance_/, "").toUpperCase() : "");
  const name = c.name || a.shortName || a.longName || a.friendly_name || symbol || c.entity;
  const qty = num(c.quantity);
  const cost = num(c.purchase_price);
  return {
    id: c.entity,
    yahoo,
    symbol,
    name,
    price,
    unit,
    change,
    pct,
    periodic,
    market: yahoo ? MARKET_STATES[String(a.marketState || "").toUpperCase()] || null : null,
    available: price !== null,
    qty,
    cost,
    value: qty !== null && price !== null ? qty * price : null,
  };
};

// ---------------------------------------------------------------------------
// Currency conversion of the portfolio total
// ---------------------------------------------------------------------------

// Minor units some exchanges quote in (London in pence, Johannesburg in cents, Tel Aviv in agorot): [currency, factor].
const MINOR_UNITS = { GBp: ["GBP", 0.01], GBX: ["GBP", 0.01], ZAc: ["ZAR", 0.01], ZAC: ["ZAR", 0.01], ILA: ["ILS", 0.01] };
const majorUnit = (unit) => MINOR_UNITS[unit] ?? [unit, 1];

// The currency the totals are shown in (`currency`), upper case, or null when the totals stay per currency.
const targetCurrency = (config) => {
  const c = String(config?.currency ?? "")
    .trim()
    .toUpperCase();
  return isIso(c) ? c : null;
};

// A Yahoo Finance currency pair: EURUSD=X is the price of 1 EUR in USD.
const PAIR = /^([A-Z]{3})([A-Z]{3})=X$/;
const pairOf = (symbol) => {
  const m = PAIR.exec(String(symbol || "").toUpperCase());
  return m ? [m[1], m[2]] : null;
};

// Factor turning an amount in `from` into `to` (1 from = factor to), from the pair [base, quote] of a rate `v`
// (1 base = v quote); null if the pair is not this one or the rate is not a positive number.
const pairFactor = (pair, v, from, to) => {
  if (!Number.isFinite(v) || v <= 0) return null;
  if (pair[0] === from && pair[1] === to) return v;
  if (pair[0] === to && pair[1] === from) return 1 / v;
  return null;
};

// Rate of `from` into `to`, with the entity it comes from (null for a number): the `exchange_rates` option first,
// then the Yahoo Finance currency pairs of Home Assistant (EURUSD=X or USDEUR=X). An `exchange_rates` key is a
// currency (`USD: 0.92`: 1 USD = 0.92 of the card's currency) or a pair (`EURUSD: 1.085`: 1 EUR = 1.085 USD); its
// value a number or a sensor, whose own Yahoo Finance pair (EURUSD=X), when it has one, decides the direction.
const rateOf = (hass, config, from, to) => {
  if (from === to) return { factor: 1, entity: null };
  const rates = config?.exchange_rates && typeof config.exchange_rates === "object" ? config.exchange_rates : {};
  for (const [key, val] of Object.entries(rates)) {
    const k = String(key).toUpperCase();
    const pair = k.length === 3 ? [k, to] : k.length === 6 ? [k.slice(0, 3), k.slice(3)] : null;
    if (!pair) continue;
    let v = typeof val === "number" ? val : null;
    let entity = null;
    let own = null;
    if (typeof val === "string" && hass?.states?.[val]) {
      entity = val;
      v = num(hass.states[val].state);
      own = pairOf(hass.states[val].attributes?.symbol);
    }
    const factor = pairFactor(own || pair, v, from, to);
    if (factor !== null) return { factor, entity };
  }
  for (const id of yahooEntities(hass || {})) {
    const pair = pairOf(hass.states[id].attributes?.symbol);
    const factor = pair && pairFactor(pair, num(hass.states[id].state), from, to);
    if (factor) return { factor, entity: id };
  }
  return null;
};

// The entities whose state the conversion reads: the sensors of `exchange_rates`, and every Yahoo Finance
// currency pair (looked up when no rate is given).
const rateEntities = (hass, config) => {
  if (!targetCurrency(config)) return [];
  const own = Object.values(config.exchange_rates && typeof config.exchange_rates === "object" ? config.exchange_rates : {}).filter((v) => typeof v === "string");
  return [...own, ...yahooEntities(hass).filter((id) => pairOf(hass.states[id].attributes?.symbol))];
};

// Portfolio totals: value, change of the day, gain against the purchase prices. One per currency, or, with a
// `currency` set, one in that currency for every quote whose currency has a rate (converted at the current rate:
// the move of the rate itself is not in the day change nor in the gain), and one per currency left without a rate
// (`noRate`). Only quotes with a quantity count; the day change only adds the ones that know it.
const totals = (quotes, { hass, config } = {}) => {
  const to = targetCurrency(config);
  const by = new Map();
  for (const q of quotes) {
    if (q.value === null) continue;
    let unit = q.unit;
    let f = 1;
    let rate = null;
    if (to) {
      const [major, minor] = majorUnit(q.unit);
      const r = isIso(major) ? rateOf(hass, config, major, to) : null;
      if (r) {
        unit = to;
        f = minor * r.factor;
        if (major !== to) rate = { from: major, factor: r.factor, entity: r.entity };
      }
    }
    const tot = by.get(unit) ?? { unit, value: 0, change: 0, hasChange: false, cost: 0, costValue: 0, hasCost: false, rates: new Map() };
    tot.value += f * q.value;
    if (q.change !== null && !q.periodic) {
      tot.change += f * q.qty * q.change;
      tot.hasChange = true;
    }
    if (q.cost !== null) {
      tot.cost += f * q.qty * q.cost;
      tot.costValue += f * q.value;
      tot.hasCost = true;
    }
    if (rate) tot.rates.set(rate.from, rate);
    by.set(unit, tot);
  }
  // The converted total first, then the currencies left as they are.
  const list = [...by.values()].sort((a, b) => Number(b.unit === to) - Number(a.unit === to));
  return list.map((tot) => {
    const before = tot.value - tot.change;
    return {
      unit: tot.unit,
      value: tot.value,
      change: tot.hasChange ? tot.change : null,
      pct: tot.hasChange && before ? (100 * tot.change) / before : null,
      gain: tot.hasCost ? tot.costValue - tot.cost : null,
      gainPct: tot.hasCost && tot.cost ? (100 * (tot.costValue - tot.cost)) / tot.cost : null,
      rates: [...tot.rates.values()],
      noRate: !!to && tot.unit !== to,
    };
  });
};

// Sorts: card order, name, change (% of the day, highest first), position value (highest first). Unavailable
// quotes always go last.
const SORTS = ["none", "name", "change", "value"];
const sortQuotes = (quotes, by, locale = "en") => {
  const list = [...quotes];
  const key = {
    name: null,
    change: (q) => q.pct,
    value: (q) => q.value,
  }[by];
  if (by === "name") list.sort((a, b) => String(a.symbol || a.name).localeCompare(String(b.symbol || b.name), locale));
  else if (key) list.sort((a, b) => (key(b) ?? -Infinity) - (key(a) ?? -Infinity));
  return list.sort((a, b) => Number(!a.available) - Number(!b.available));
};

// Market status of the card: the most active one of its Yahoo Finance quotes (open, then pre-market, after hours,
// closed), with the quote that gives it (opened by a click on the chip).
const marketOf = (quotes) => {
  for (const m of ["open", "pre", "post", "closed"]) {
    const q = quotes.find((x) => x.market === m);
    if (q) return { state: m, id: q.id };
  }
  return null;
};

// ---------------------------------------------------------------------------
// Sparklines
// ---------------------------------------------------------------------------

// Window and statistics period of each sparkline period. The 5-minute statistics are kept 10 days by the recorder,
// the hourly ones for ever.
const PERIODS = {
  "1d": { window: 864e5, stat: "5minute", step: 3e5 },
  "5d": { window: 5 * 864e5, stat: "hour", step: 36e5 },
  "1m": { window: 30 * 864e5, stat: "hour", step: 36e5 },
  "3m": { window: 91 * 864e5, stat: "day", step: 864e5 },
  "1y": { window: 365 * 864e5, stat: "day", step: 864e5 },
};
const periodOf = (config) => (PERIODS[config?.history_period] ? config.history_period : "1d");
const HIST_REFRESH = 5 * 60000;
// At most this many points per sparkline: history without statistics can hold thousands of states.
const MAX_POINTS = 240;

const downsample = (points, max = MAX_POINTS) => {
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
function spark(points, end, window, step, cls = "spark") {
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
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --st-up: var(--success-color, #43a047); --st-down: var(--error-color, #db4437); --st-warn: var(--warning-color, #ffa600);
          --st-idle: var(--disabled-text-color, #9e9e9e); --st-accent: #6d5dfc; }
  :host { display: block; }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* A size container has no content width: this empty grid gives the card a natural width of 300 px with no minimum,
     so it still shrinks to its track in a "1fr" grid column or a flex row (as in the other ha-* cards). */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 300px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .up { --c: var(--st-up); } .down { --c: var(--st-down); } .flat, .idle { --c: var(--st-idle); }
  .ok { --c: var(--st-up); } .warn { --c: var(--st-warn); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--st-up)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--st-up)) 15%, transparent); color: var(--c, var(--st-up)); }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  /* Tinted round icon, in the colour of the day's trend; it opens Yahoo Finance (or the url option). */
  .logo { height: 40px; width: 40px; flex: none; border-radius: 50%; display: grid; place-items: center;
          color: var(--c, var(--st-accent)); background: color-mix(in srgb, var(--c, var(--st-accent)) 16%, transparent); }
  .logo.idle, .logo.flat { --c: var(--st-accent); }
  .logo .icon { width: 24px; height: 24px; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .header .chip { flex: 0 1 auto; min-width: 0; overflow: hidden; line-height: 16px; box-sizing: border-box; }
  .header .chip.idle { color: var(--primary-text-color); }
  .chip-label { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .header:has(.sub) .titles { align-self: flex-start; }
  .header:has(.sub) .chip { align-self: flex-start; margin-top: 1px; }
  @container (max-width: 239px) {
    .header { gap: 6px; }
    .header .chip { flex: none; padding: 6px; }
    .header .chip .chip-label { display: none; }
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

// Appended last to every card style: with "reduce motion" set, nothing animates.
const MOTION_STYLE = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
`;

const FULL_STYLE = `
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

const MINI_STYLE = `
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

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class StockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
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
    const sig = [h.entities, h.language, h.locale?.language];
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
    const market = c.show_market_state !== false ? marketOf(quotes) : null;
    // Icon tinted by the day's move of the portfolio, else of the quotes on average.
    const pcts = quotes.map((q) => q.pct).filter((v) => v !== null);
    const dayTrend = tots.length === 1 && tots[0].pct !== null ? trend(tots[0].pct) : pcts.length ? trend(pcts.reduce((a, b) => a + b, 0)) : "idle";
    const sub = [`${n} ${tn(this._hass, c, "quotes_lc", n)}`];
    if (quotes.some((q) => q.yahoo)) sub.push("Yahoo Finance");
    const chipCls = { open: "ok", pre: "warn", post: "warn", closed: "idle" }[market?.state];
    const chipText = market ? esc(this._t(`market_${market.state}`)) : "";
    return `
      <div class="header">
        <a class="logo ${dayTrend}" href="${esc(this._logoUrl())}" target="_blank" rel="noopener noreferrer" title="${esc(c.title || this._t("title_default"))}" aria-label="${esc(
          c.title || this._t("title_default"),
        )}">${svgIcon(ICONS.chart)}</a>
        <div class="titles">
          <div class="name">${esc(c.title || this._t("title_default"))}</div>
          <div class="sub">${esc(sub.join(" · "))}</div>
        </div>
        ${
          market
            ? `<span class="chip clickable ${chipCls}" role="button" tabindex="0" data-entity="${esc(market.id)}" title="${chipText}" aria-label="${chipText}"><span class="dot"></span><span class="chip-label">${chipText}</span></span>`
            : ""
        }
        ${this._zoomButton()}
      </div>`;
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
    return `<style>${BASE_STYLE}${FULL_STYLE}${MOTION_STYLE}</style>
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

const fmtNumber = (v, locale) => nf(locale, { maximumFractionDigits: 4 }).format(v);

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// A click or tap outside of the card, and not in a Home Assistant dialog opened from it.
const isOutside = (card, ev) => !ev.composedPath().includes(card) && !inDialog(ev);

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event.
const watchOutside = (card, handler) => {
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
class StockMiniCard extends StockCard {
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
    this._unzoom.on();
    // Back on the page after leaving it: rendered again in the compact view.
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
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
    return `<style>${BASE_STYLE}${MINI_STYLE}${MOTION_STYLE}</style>
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

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

// The quotes are picked in an entity list; each one's quantity and purchase price (the portfolio) are number
// fields named `qty|<entity>` and `cost|<entity>`, folded back into `entities` objects in the saved YAML.
const PORTFOLIO_FIELD = /^(qty|cost)\|(.+)$/;
// The sensor of each exchange rate, a field named `rate|<currency>`, folded back into `exchange_rates`.
const RATE_FIELD = /^rate\|(.+)$/;

// Currencies offered for the total (any other ISO code can be typed in).
const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "AUD", "NZD", "HKD", "SGD", "CNY", "INR", "KRW", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF",
  "RON", "BGN", "RSD", "UAH", "TRY", "ILS", "ZAR", "BRL", "MXN"];

// "EUR — euro", the name in the editor's language when the browser knows it.
const currencyLabel = (code, locale) => {
  try {
    const name = new Intl.DisplayNames([locale], { type: "currency" }).of(code);
    return name && name !== code ? `${code} — ${name}` : code;
  } catch (_err) {
    return code;
  }
};

class StockEditorBase extends HTMLElement {
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
      ...(ids.length && this.constructor.portfolio
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
          ...(this.constructor.portfolio
            ? [
                {
                  name: "change_display",
                  selector: {
                    select: { mode: "dropdown", options: ["both", "percent", "absolute"].map((value) => ({ value, label: tr(`change_${value}`) })) },
                  },
                },
              ]
            : [{ name: "max_items", selector: { number: { min: 1, max: 20, step: 1, mode: "box" } } }]),
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
    return { ...Object.fromEntries(this.constructor.toggles), history_period: "1d", sort_by: "none", change_display: "both", max_items: 5 };
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

class StockCardEditor extends StockEditorBase {
  static get portfolio() {
    return true;
  }

  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_name", true],
      ["show_history", true],
      ["show_total", true],
      ["show_market_state", true],
    ];
  }
}

class StockMiniCardEditor extends StockEditorBase {
  static get portfolio() {
    return false;
  }

  static get toggles() {
    return [
      ["show_history", true],
      ["show_total", true],
      ["show_market_state", true],
      ["zoom", true],
    ];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
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
