# Changelog

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