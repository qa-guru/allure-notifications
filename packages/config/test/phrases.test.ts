import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { declareSuite } from "@qa-guru/allure-notifications-test-meta";

declareSuite({
  feature: "config",
  story: "Phrase packs and language resolution",
  layer: "unit",
  component: "@qa-guru/allure-notifications-config",
  severity: "normal",
});

import {
  PHRASES,
  captionPhrasesFor,
  phrasesFor,
  resolvePhraseLanguage,
} from "../src/phrases.js";

describe("@qa-guru/allure-notifications-config phrases", () => {
  it("resolvePhraseLanguage defaults undefined to en", () => {
    assert.equal(resolvePhraseLanguage(undefined), "en");
  });

  it("resolvePhraseLanguage accepts known locales case-insensitively", () => {
    assert.equal(resolvePhraseLanguage("ru"), "ru");
    assert.equal(resolvePhraseLanguage("DE"), "de");
    assert.equal(resolvePhraseLanguage("morse"), "morse");
  });

  it("resolvePhraseLanguage falls back to en for unknown locale", () => {
    assert.equal(resolvePhraseLanguage("xx-unknown"), "en");
    assert.equal(resolvePhraseLanguage(""), "en");
  });

  it("phrasesFor returns pack for resolved language", () => {
    assert.equal(phrasesFor("ru"), PHRASES.ru);
    assert.equal(phrasesFor("not-a-locale"), PHRASES.en);
  });

  it("captionPhrasesFor flattens scenario fields", () => {
    const caption = captionPhrasesFor("de");
    assert.equal(caption.results, PHRASES.de.results);
    assert.equal(caption.duration, PHRASES.de.scenario.duration);
    assert.equal(caption.links.report, PHRASES.de.links.report);
  });
});
