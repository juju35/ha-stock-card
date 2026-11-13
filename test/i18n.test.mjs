import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS, lang, tn, pluralLocale, LANG_OPTIONS } = load("stock-card.js", ["STRINGS", "lang", "tn", "pluralLocale", "LANG_OPTIONS"]);
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
// Plural forms (key_one, key_few, key_many…) are optional per language: the key without suffix is the fallback.
const PLURAL = /_(zero|one|two|few|many|other)$/;

test("I18N parity: every language has exactly the keys of en", () => {
  const ref = Object.keys(STRINGS.en).filter((k) => !PLURAL.test(k)).sort();
  for (const code of ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl", "ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"]) {
    assert.ok(STRINGS[code], `missing language ${code}`);
    const keys = Object.keys(STRINGS[code]);
    assert.deepEqual(keys.filter((k) => !PLURAL.test(k)).sort(), ref, `key mismatch in ${code}`);
    for (const k of keys.filter((k) => PLURAL.test(k))) {
      const base = k.replace(PLURAL, "");
      assert.ok(base in STRINGS.en, `${code}.${k} has no base key in en`);
      assert.ok(String(STRINGS[code][k]).trim() !== "", `${code}.${k} is empty`);
      assert.deepEqual(placeholders(STRINGS[code][k]), placeholders(STRINGS.en[base]), `placeholders of ${code}.${k}`);
    }
    // A key with plural forms covers every category the language uses for a realistic count, 0 to 1000
    // (other may use the base key; fr, es, it and pt "many" only starts at a million).
    const bases = new Set(keys.filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, "")));
    const rules = new Intl.PluralRules(pluralLocale(code));
    const cats = [...new Set(Array.from({ length: 1001 }, (_, n) => rules.select(n)))].filter((c) => c !== "other");
    for (const base of bases) for (const c of cats) assert.ok(`${base}_${c}` in STRINGS[code], `missing ${code}.${base}_${c}`);
    for (const key of ref) {
      const value = STRINGS[code][key];
      if (Array.isArray(STRINGS.en[key])) {
        assert.ok(Array.isArray(value), `${code}.${key} should be an array`);
        assert.equal(value.length, STRINGS.en[key].length, `length of ${code}.${key}`);
      }
      assert.ok(String(value).trim() !== "", `${code}.${key} is empty`);
      assert.deepEqual(placeholders(value), placeholders(STRINGS.en[key]), `placeholders of ${code}.${key}`);
    }
  }
});

test("I18N script: sr is Cyrillic and sr-Latn is Latin (proper nouns, brands and units aside)", () => {
  const keep = /Yahoo Finance|URL|[A-Z]{6}=X|\{\w+\}/g;
  for (const [key, value] of Object.entries(STRINGS.sr)) {
    assert.doesNotMatch(String(value).replace(keep, ""), /[A-Za-z]/, `Latin letter in sr.${key}`);
  }
  for (const [key, value] of Object.entries(STRINGS["sr-Latn"])) {
    assert.doesNotMatch(String(value), /[Ѐ-ӿ]/, `Cyrillic letter in sr-Latn.${key}`);
  }
});

test("I18N resolution: full code, then the part before the dash, then en", () => {
  const hass = (language) => ({ locale: { language } });
  assert.equal(lang(hass("fr-FR")), "fr");
  assert.equal(lang(hass("sr-Latn")), "sr-Latn");
  assert.equal(lang(hass("sr")), "sr");
  assert.equal(lang(hass("ja")), "en");
  assert.equal(lang(hass("sr-Latn"), { language: "de" }), "de", "config.language wins over hass");
  assert.equal(lang({ language: "sr-Latn" }), "sr-Latn", "hass.language is used without hass.locale");
});

test("I18N resolution: Italian, Dutch, Portuguese and Polish", () => {
  const hass = (language) => ({ locale: { language } });
  assert.equal(lang(hass("it-IT")), "it");
  assert.equal(lang(hass("nl-BE")), "nl");
  assert.equal(lang(hass("pt")), "pt");
  assert.equal(lang(hass("pt-BR")), "pt", "Brazilian Portuguese falls back to European Portuguese");
  assert.equal(lang(hass("pl-PL")), "pl");
  assert.equal(lang(hass("sr-Latn")), "sr-Latn");
  assert.equal(lang(hass("ja")), "en");
});

test("I18N resolution: Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek", () => {
  const hass = (language) => ({ locale: { language } });
  for (const code of ["ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"]) {
    assert.equal(lang(hass(code)), code);
  }
  assert.equal(lang(hass("ro-RO")), "ro");
  assert.equal(lang(hass("sv-FI")), "sv");
  assert.equal(lang(hass("ru-RU")), "ru");
  assert.equal(lang(hass("cs-CZ")), "cs");
  assert.equal(lang(hass("el-GR")), "el");
  assert.equal(lang(hass("ja")), "en");
});

test("Editor: the language list offers every translation, plus automatic", () => {
  const values = ["", ...LANG_OPTIONS.map(([v]) => v)];
  assert.deepEqual([...values].sort(), ["", ...Object.keys(STRINGS)].sort());
});

test("I18N plurals: the quote count reads right for 1, 2, 5, 21 and 22", () => {
  const n = (code, k) => tn({ locale: { language: code } }, {}, "quotes_lc", k);
  assert.equal(n("en", 1), "quote");
  assert.equal(n("en", 2), "quotes");
  assert.equal(n("fr", 0), "valeur", "French 0 is singular");
  assert.equal(n("pl", 2), "notowania");
  assert.equal(n("pl", 5), "notowań");
  assert.equal(n("pl", 22), "notowania");
  assert.equal(n("ru", 21), "котировка");
  assert.equal(n("ru", 5), "котировок");
  assert.equal(n("uk", 5), "котирувань");
  assert.equal(n("sr", 3), "котације");
  assert.equal(n("sl", 2), "tečaja");
  assert.equal(n("cs", 5), "kurzů");
  assert.equal(n("ro", 20), "de cotații");
  assert.equal(n("lv", 10), "kotāciju");
  assert.equal(n("pt", 0), "títulos", "European Portuguese 0 is plural");
});

test("README: the features list names every language the cards ship", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const line = readme.split("\n").find((l) => /^- Light and dark mode/.test(l));
  assert.ok(line, "no language line in the features list");
  for (const name of ["English", "French", "German", "Spanish", "Serbian", "Italian", "Dutch", "Portuguese", "Polish",
    "Romanian", "Danish", "Swedish", "Bulgarian", "Russian", "Ukrainian", "Hungarian", "Slovak", "Czech",
    "Slovenian", "Latvian", "Greek"]) {
    assert.match(line, new RegExp(name), `${name} missing from: ${line}`);
  }
  for (const code of Object.keys(STRINGS)) assert.match(readme, new RegExp(`\\| \`${code}\` \\|`), `${code} missing from the table`);
});
