'use strict';

const { epic, feature, label, layer, severity, story } = require('allure-js-commons');

const DEFAULT_EPIC = 'allure-notifications';

/** @param {import('./dist/src/types.js').SuiteMeta} meta */
async function applySuiteMeta(meta) {
  await epic(meta.epic ?? DEFAULT_EPIC);
  await feature(meta.feature);
  await story(meta.story);
  await layer(meta.layer);
  await severity(meta.severity);
  if (meta.component) {
    await label('component', meta.component);
  }
}

/** @param {{ beforeEach: (fn: () => void | Promise<void>) => void }} test @param {import('./dist/src/types.js').SuiteMeta} meta */
function bindSuiteMeta(test, meta) {
  test.beforeEach(async () => {
    await applySuiteMeta(meta);
  });
}

module.exports = { bindSuiteMeta, DEFAULT_EPIC, applySuiteMeta };
