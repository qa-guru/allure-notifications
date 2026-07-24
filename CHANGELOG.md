# Changelog

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
- **Alias** `pie` ↔ `currentStatus` unchanged for free-grid `items`
- **Skipped (no analytics/history series yet):** `statusTransitions`, `testBaseGrowthDynamics`, `coverageDiff`, `problemsDistribution`, `stabilityDistribution`, `durationDynamics`, `statusAgePyramid` — deferred until data model exists
- Dogfood: `config/config.preview-cb870-cardgap.json` (+ wide gap spot-check)
- CB-870 free `items` shape unchanged

### Russian

- **`chart.cardGap`** — настраиваемый зазор между карточками (по умолчанию **14**, бывший `CARD_GAP`); `CollageRenderer` читает через `resolveCardGap` вместе с `headerHeight`
- **Панель `testResultSeverities`** — горизонтальные бары severity из labels `allure-results`
- Алиас `pie` ↔ `currentStatus` сохранён; форма CB-870 `items` без изменений
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