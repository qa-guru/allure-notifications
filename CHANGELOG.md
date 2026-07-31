# Changelog

## Unreleased

## v 6.0.11

### English

- **Coverage** — `resolvePhraseLanguage` unit tests (`packages/config/test/phrases.test.ts`); builder e2e covers palette `dragend` non-Element target (100% branch gate on Node 26)

### Russian

- **Coverage** — unit-тесты `resolvePhraseLanguage` (`packages/config/test/phrases.test.ts`); builder e2e закрывает `dragend` с non-Element target (100% branch gate на Node 26)

## v 6.0.10

### English

- **Toolchain** — unified **Node 26** (CI, `.nvmrc`, `engines.node >=26`) and **TypeScript 7.0.2** pin across workspace; `@types/node` **26.1.2**

### Russian

- **Toolchain** — единый **Node 26** (CI, `.nvmrc`, `engines.node >=26`) и pin **TypeScript 7.0.2** по workspace; `@types/node` **26.1.2**

## v 6.0.9

### English

- **TS test blanket** ([PR #496](https://github.com/qa-guru/allure-notifications/pull/496)) — c8 hard floors lines/statements **100%** on `packages/{config,pyramid,core,cli,plugin}/src`; builder e2e blanket + Playwright tests migrated to TypeScript; `@allure-notifications/test-meta` for explicit Allure suite labels
- **Collage** — cap pyramid/durations tile height in tall free-layout cells; Telegram CI layout pyramid w3 + durations by layer w4; pie paints 1-test slices as dots when Skia drops tiny arcs
- **Telegram** — FTL-parity caption (RU labels, real links); CI sends this-run report (no dogfood fallback); single-run collage with testing pyramid
- **Builder** — theme/terminal/darkMode sync; L-bracket gutter chrome; palette 4-up/5-up; monochrome Allure header mark; `@allure-notifications/config` phrase SSOT in browser bundle
- **feat: German locale (`de`)** — schema, jar phrases/legend, builder select, CLI Telegram caption, preview omni-tool flag; shared `PHRASES` in `@allure-notifications/config`
- **Quality** — Sonar gate clean on `allure-notifications` projectKey; panel gallery dev script + marketing collage configs

### Russian

- **TS test blanket** ([PR #496](https://github.com/qa-guru/allure-notifications/pull/496)) — c8 hard floors lines/statements **100%** на `packages/{config,pyramid,core,cli,plugin}/src`; builder e2e blanket + Playwright-тесты на TypeScript; `@allure-notifications/test-meta` для явных Allure suite labels
- **Collage** — cap высоты pyramid/durations в tall free-layout; Telegram CI layout pyramid w3 + durations by layer w4; pie рисует 1-test slices точками, когда Skia теряет tiny arcs
- **Telegram** — caption FTL-parity (RU labels, реальные links); CI шлёт this-run report (без dogfood fallback); single-run collage с testing pyramid
- **Builder** — sync theme/terminal/darkMode; L-bracket gutter chrome; palette 4-up/5-up; monochrome Allure mark в header; phrase SSOT из `@allure-notifications/config` в browser bundle
- **feat: немецкая локаль (`de`)** — schema, jar phrases/legend, select в builder, caption CLI Telegram, флаг в preview omni-tool; общий `PHRASES` в `@allure-notifications/config`
- **Quality** — Sonar gate clean на projectKey `allure-notifications`; dev-скрипт panel gallery + marketing collage configs

## v 6.0.8

### English

- **Version sync** — CLI, libs, and `@allure-notifications/plugin` all publish as **6.0.8** (align after plugin-only 6.0.7; skip broken 6.0.6)
- No product feature change vs 6.0.5/6.0.7 — consumer pin is now one number

### Russian

- **Синхронизация версий** — CLI, libs и `@allure-notifications/plugin` публикуются как **6.0.8** (выравнивание после plugin-only 6.0.7; битый 6.0.6 пропускаем)
- Без новых фич относительно 6.0.5/6.0.7 — один номер для consumers

## v 6.0.7

### English

- **Plugin resolve fix** — `@allure-notifications/plugin` adds `main`/`module`/`types` so Allure 3 `require.resolve` can load the package (6.0.5 / npm `6.0.6` were `exports`-only and broke `allurerc` import)
- **GitHub Actions example (plugin path)** — `examples/github-actions/` + `.github/workflows/example-plugin-notify.yml` (two-step generate; not CLI Q4)

### Russian

- **Фикс resolve плагина** — у `@allure-notifications/plugin` добавлены `main`/`module`/`types` (6.0.5 / npm `6.0.6` — `exports`-only, Allure не резолвил пакет из `allurerc`)
- **Пример GitHub Actions (plugin)** — `examples/github-actions/` + `.github/workflows/example-plugin-notify.yml` (два generate; не CLI Q4)

## v 6.0.6

### English

- **Do not use** — npm `6.0.6` published without `main` (same resolve break as 6.0.5). Use **6.0.7**.

### Russian

- **Не использовать** — npm `6.0.6` без `main` (тот же break resolve, что у 6.0.5). Берите **6.0.7**.

## v 6.0.5

### English

- **Allure 3 plugin** — `@allure-notifications/plugin` (`packages/plugin`): `Plugin.done` → parseConfig → core collage PNG → CLI messengers; `mode` dry-run|mock|live (default dry-run); example `examples/allurerc.notifications.mjs`

### Russian

- **Allure 3 plugin** — `@allure-notifications/plugin` (`packages/plugin`): `Plugin.done` → parseConfig → collage PNG (core) → messengers (CLI); `mode` dry-run|mock|live (default dry-run); пример `examples/allurerc.notifications.mjs`

## v 6.0.3

### English

- **Real analytics panels** — `statusDynamics` / `successRate` / `severities` / `suites` (history + results)
- **Catalog stubs → real** — all 7 former stub types render data when A3/`history.jsonl` present; honest empty captions otherwise
- **Builder full TypeScript** — `apps/builder/src` → `tsc` emit `js/`; workspace on `typescript@7`

### Russian

- **Реальные analytics-панели** — `statusDynamics` / `successRate` / `severities` / `suites` (history + results)
- **Catalog stubs → real** — все 7 бывших stub-типов рисуют данные при наличии A3/`history.jsonl`; иначе честные empty captions
- **Builder на TypeScript** — `apps/builder/src` → emit `js/`; workspace на `typescript@7`

## v 6.0.2

### English

- **CLI `-V` / banner** — report version from `package.json` (npm `6.0.1` incorrectly printed `6.0.0`)
- **Config validation errors** — path-scoped messages instead of raw Zod JSON dump

### Russian

- **CLI `-V` / banner** — версия из `package.json` (на npm `6.0.1` печаталось `6.0.0`)
- **Ошибки валидации config** — path-scoped сообщения вместо сырого Zod JSON

## v 5.0.8

### English

- **Horizontal bar panels (suites / severities / durations-by-layer)** — cap row/bar height so a single suite no longer inflates into a near-circular pill that fills the collage tile

### Russian

- **Горизонтальные бары (suites / severities / durations-by-layer)** — потолок высоты строки/бара: одна suite больше не раздувается в «круг» на весь тайл

## v 5.0.7

### English

- **Stacked status-dynamics bars** — segment heights match values exactly without clipping top rounding
- **`durations` + pyramid order** — layer rows follow testing-pyramid top-to-bottom order

### Russian

- **Stacked status-dynamics** — высоты сегментов без обрезки скругления сверху
- **`durations` + порядок pyramid** — строки слоёв как в testing pyramid (сверху вниз)

## v 5.0.6

### English

- **Telegram proxy from `config.json`** — `TelegramClient` uses Apache HttpClient via `HttpClientFactory` (same as Slack/Cliq); no `proxychains4` wrapper required
- **`proxy.type`** — `http` (default) or `socks5`; overrides via `-Dnotifications.proxy.*`

### Russian

- **Telegram через proxy из `config.json`** — `TelegramClient` на Apache HttpClient; SOCKS5 без auth (prod: `proxy.qaguru.school:7777`)
- **`proxy.type`** — `http` (по умолчанию) или `socks5`; override через `-Dnotifications.proxy.*`

## v 5.0.5

### English

- **SQ-1080 dense 12-tile** — free layout keeps all catalog tiles (empty-state instead of silent drop)
- **`ChartPanelItem.by` / `groupBy`** — parsed for catalog variants; unknown JSON (incl. `tilePad`) ignored
- **`chart.tilePad`** — retained for builder/preview parity (renderer unchanged)
- **Stub panels (empty-state):** `statusTransitions`, `problemsDistribution`, `coverageDiff`, `statusAgePyramid`, `stabilityDistribution`, `durationDynamics`, `testBaseGrowthDynamics`
- **`durations` + `groupBy: layer`** — per-layer average bars; falls back to histogram when no layer samples
- Dogfood: `config/config.preview-sq1080.json` → `config/chart-sq1080-dogfood.png` (1080×1080)
- CB-870 free `items` + legacy `grid|stacked|row` unchanged

### Russian

- **SQ-1080 dense 12-tile** — free layout не silent-drop: stub-панели → empty-state
- **`by` / `groupBy`** на `ChartPanelItem`; `tilePad` парсится и игнорируется рендерером
- **`durations` + `groupBy: layer`** — средние по слоям, иначе fallback на гистограмму
- Dogfood: `config/config.preview-sq1080.json`

## v 5.0.4

### English

- **`chart.cardGap`** — configurable inter-card gap (default **14**, former hard-coded `CARD_GAP`); `CollageRenderer` resolves via `resolveCardGap` alongside existing `headerHeight`
- **`testResultSeverities` panel** — horizontal severity bars from `allure-results` severity labels (awesome-charts catalog #3); aliases `severities` / `severity`
- Free-grid status panel type is Allure 3 `currentStatus` (no `pie` alias)
- **Skipped (no analytics/history series yet):** `statusTransitions`, `testBaseGrowthDynamics`, `coverageDiff`, `problemsDistribution`, `stabilityDistribution`, `durationDynamics`, `statusAgePyramid` — deferred until data model exists
- Dogfood: `config/config.preview-cb870-cardgap.json` (+ wide gap spot-check)
- CB-870 free `items` shape unchanged

### Russian

- **`chart.cardGap`** — настраиваемый зазор между карточками (по умолчанию **14**, бывший `CARD_GAP`); `CollageRenderer` читает через `resolveCardGap` вместе с `headerHeight`
- **Панель `testResultSeverities`** — горизонтальные бары severity из labels `allure-results`
- Тип статус-панели — Allure 3 `currentStatus` (без алиаса `pie`); форма CB-870 `items` без изменений
- Остальные типы каталога 17 без данных — stub/skip до появления analytics/history

## v 5.0.0

### English

- **Collage chart** — `chart.mode: collage` renders a 1000×600 PNG with three panels: pie (status), testing pyramid (or suites fallback), and durations
- **Chart panels** — `PiePanel`, `SuitesPanel`, `DurationsPanel`, `TestingPyramidPanel` via `CollageRenderer`; default `chart.mode: pie` keeps 4.x behaviour
- **Links block** — `base.links` with report, dashboard, testops, and build URLs; i18n labels in all templates
- **Allure 3 support** — `ReportLocator` auto-detects Allure 2 (`widgets/summary.json`) vs Allure 3 (`summary.json` at report root)
- **`reportLink` deprecated** — maps to `links.report`; backward compatible fallback
- **Report analytics** — `ReportAnalytics` from `allure-results` for pyramid layers, top suites, and duration histogram
- **Pyramid colors** — Palette A (`PyramidLayerColors`) aligned with monorepo test-layer canon
- Docs: [migration-5.0.md](docs/migration-5.0.md), [ci-cookbook-5.0.md](docs/ci-cookbook-5.0.md), example [config-5.0-collage.example.json](config/config-5.0-collage.example.json)

### Russian

- **Collage chart** — `chart.mode: collage` формирует PNG 1000×600 с тремя панелями: pie (статусы), testing pyramid (или fallback suites), durations
- **Панели диаграммы** — `PiePanel`, `SuitesPanel`, `DurationsPanel`, `TestingPyramidPanel` через `CollageRenderer`; по умолчанию `chart.mode: pie` — поведение как в 4.x
- **Блок links** — `base.links`: report, dashboard, testops, build; i18n-подписи во всех шаблонах
- **Поддержка Allure 3** — `ReportLocator` автоматически определяет Allure 2 (`widgets/summary.json`) и Allure 3 (`summary.json` в корне отчёта)
- **`reportLink` устарел** — маппится в `links.report`; обратная совместимость сохранена
- **Аналитика отчёта** — `ReportAnalytics` из `allure-results`: слои pyramid, top suites, гистограмма durations
- **Цвета pyramid** — Palette A (`PyramidLayerColors`) по канону test-layers monorepo
- Документация: [migration-5.0.md](docs/migration-5.0.md), [ci-cookbook-5.0.md](docs/ci-cookbook-5.0.md), пример [config-5.0-collage.example.json](config/config-5.0-collage.example.json)

## v 2.0.1

### English
- Updated [README.md](README.md) to use the new command line parsing library
- Added message templates (_ru/en_)
- Added support for English
- Added contract of bots (_AllureBot_)
- Added BaseClient for sending messages (_by default in telegram_)
- Added TelegramClient to encapsulate the logic for sending messages via TelegramBot
- Refactoring of the PieChartBuilder class
- Removed PieChartBot and TextBot
- Added Attachment class, encapsulating photo and text creation for sending via bot

### Russian
- Обновлён [README.md](README.md) под использование новой библиотеки парсинга командной строки
- Добавлены темплейты сообщений (_ru/en_)
- Добавлена поддержка английского языка
- Добавлен контракт ботов AllureBot
- Добавлен BaseClient для отправки сообщений (_по умолчанию в telegram_)
- Добавлен TelegramClient для инкапсулирования логики по отправке сообщений через TelegramBot
- Произведён рефакторинг класса PieChartBuilder
- Удалены PieChartBot и TextBot
- Добавлен класс Attachment, инкапсулирующий создание фото и текста для отправки через бота

## v 2.0.2

### English

- Fixed bug with passing parameters by keys `-l` and `-e`
- Added Template contract for template development
- Added TemplateData class to store information for reports
- Added RuTemplate and EngTemplate classes that implement the new contract
- Added a Telegram class that implements the generation of a formatted message
- Added a method for generating TemplateData in the Utils class
- TemplateFactory class now returns formatted message
- Implemented workflow for publishing releases with new assemblies to GitHub 

### Russian

- Исправлена ошибка с передачей параметров по ключам `-l` и `-e`
- Добавлен контракт Template для разработки шаблонов
- Добавлен класс TemplateData для хранения информации для отчетов
- Добавлены классы RuTemplate и EngTemplate, реализующие новый контракт
- Добавлен класс Telegram, реализующий генерацию отформатированного сообщения
- Добавлен метод по генерации TemplateData в классе Utils
- Класс TemplateFactory теперь возвращает отформатированное сообщение
- Реализован workflow для публикации релизов с новыми сборками в GitHub