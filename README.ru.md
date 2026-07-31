[![en](https://img.shields.io/badge/lang-en-white.svg)](README.md) [![ru](https://img.shields.io/badge/lang-ru-blue.svg)](#) [![fr](https://img.shields.io/badge/lang-fr-white.svg)](README.fr.md)

# Allure notifications

**Красивые уведомления о прогоне автотестов — прямо в мессенджер.**

Collage PNG + текст со статистикой и ссылками. Соберите `config.json` в [Config builder](#config-builder-anb), отправьте через CLI на TypeScript **6.0.11**.

## Пример уведомления

<img width="488" alt="Пример уведомления Telegram: collage + статистика + ссылки" src="docs/notification-example.png">

| Зона | Что внутри |
|------|------------|
| Collage | 7 панелей: pie · status dynamics · pyramid · durations · success rate · duration dynamics · status transitions |
| Текст | окружение, комментарий, duration, счётчики passed / failed / broken / skipped |
| Ссылки | `report` · `dashboard` · `testops` · `build` из `base.links` |

## Omni-tool

([allure-notifications.qa.guru](https://allure-notifications.qa.guru/) · [qa-guru.github.io/allure-notifications](https://qa-guru.github.io/allure-notifications/))

### 1. Messengers

Нет вашего канала? [Issue](https://github.com/qa-guru/allure-notifications/issues/new) или [PR](https://github.com/qa-guru/allure-notifications/compare).

<p>
  <img src="docs/preview/icons/messengers/telegram.svg" width="20" height="20" alt=""> Telegram
  · <img src="docs/preview/icons/messengers/slack.svg" width="20" height="20" alt=""> Slack
  · <img src="docs/preview/icons/messengers/email.svg" width="20" height="20" alt=""> Email
  · <img src="docs/preview/icons/messengers/mattermost.svg" width="20" height="20" alt=""> Mattermost
  · <img src="docs/preview/icons/messengers/discord.svg" width="20" height="20" alt=""> Discord
  · <img src="docs/preview/icons/messengers/loop.svg" width="20" height="20" alt=""> Loop
  · <img src="docs/preview/icons/messengers/rocketdotchat.svg" width="20" height="20" alt=""> Rocket.Chat
  · <img src="docs/preview/icons/messengers/zoho.svg" width="20" height="20" alt=""> Zoho Cliq
  · <img src="docs/preview/icons/messengers/microsoftteams.svg" width="20" height="20" alt=""> Microsoft Teams
</p>

### 2. Any CI

Работает везде, где есть Allure results — от ноутбука до hosted CI.

<p>
  <img src="docs/preview/icons/ci/local.svg" width="20" height="20" alt=""> local
  · <img src="docs/preview/icons/ci/githubactions.svg" width="20" height="20" alt=""> GitHub Actions
  · <img src="docs/preview/icons/ci/gitlab.svg" width="20" height="20" alt=""> GitLab CI
  · <img src="docs/preview/icons/ci/amazonaws.svg" width="20" height="20" alt=""> AWS CI
  · <img src="docs/preview/icons/ci/azuredevops.svg" width="20" height="20" alt=""> Azure DevOps
  · <img src="docs/preview/icons/ci/jenkins.svg" width="20" height="20" alt=""> Jenkins
  · <img src="docs/preview/icons/ci/bamboo.svg" width="20" height="20" alt=""> Bamboo
  · <img src="docs/preview/icons/ci/bitbucket.svg" width="20" height="20" alt=""> Bitbucket Pipelines
  · <img src="docs/preview/icons/ci/teamcity.svg" width="20" height="20" alt=""> TeamCity
  · <img src="docs/preview/icons/ci/circleci.svg" width="20" height="20" alt=""> CircleCI
  · <img src="docs/preview/icons/ci/buildkite.svg" width="20" height="20" alt=""> Buildkite
</p>

…и любой другой runner, который может выполнить CLI.

### 3. Any language with Allure

Адаптеры фреймворков → [список на allurereport.org](https://allurereport.org/docs/frameworks/).

<p>
  <img src="docs/preview/icons/languages/java.svg" width="20" height="20" alt=""> Java
  · <img src="docs/preview/icons/languages/kotlin.svg" width="20" height="20" alt=""> Kotlin
  · <img src="docs/preview/icons/languages/groovy.svg" width="20" height="20" alt=""> Groovy
  · <img src="docs/preview/icons/languages/javascript.svg" width="20" height="20" alt=""> JavaScript
  · <img src="docs/preview/icons/languages/typescript.svg" width="20" height="20" alt=""> TypeScript
  · <img src="docs/preview/icons/languages/python.svg" width="20" height="20" alt=""> Python
  · <img src="docs/preview/icons/languages/csharp.svg" width="20" height="20" alt=""> C#
  · <img src="docs/preview/icons/languages/php.svg" width="20" height="20" alt=""> PHP
  · <img src="docs/preview/icons/languages/ruby.svg" width="20" height="20" alt=""> Ruby
  · <img src="docs/preview/icons/languages/go.svg" width="20" height="20" alt=""> Go
  · <img src="docs/preview/icons/languages/rust.svg" width="20" height="20" alt=""> Rust
  · <img src="docs/preview/icons/languages/dart.svg" width="20" height="20" alt=""> Dart
</p>

### 4. Notification locales

Нет вашей локали? [Issue](https://github.com/qa-guru/allure-notifications/issues/new) или [PR](https://github.com/qa-guru/allure-notifications/compare).

<p>
  <img src="docs/preview/icons/locales/en.svg" width="20" height="20" alt=""> <code>en</code>
  · <img src="docs/preview/icons/locales/de.svg" width="20" height="20" alt=""> <code>de</code>
  · <img src="docs/preview/icons/locales/fr.svg" width="20" height="20" alt=""> <code>fr</code>
  · <img src="docs/preview/icons/locales/ru.svg" width="20" height="20" alt=""> <code>ru</code>
  · <img src="docs/preview/icons/locales/by.svg" width="20" height="20" alt=""> <code>by</code>
  · <img src="docs/preview/icons/locales/ua.svg" width="20" height="20" alt=""> <code>ua</code>
  · <img src="docs/preview/icons/locales/cn.svg" width="20" height="20" alt=""> <code>cn</code>
  · <img src="docs/preview/icons/locales/cnt.svg" width="20" height="20" alt=""> <code>cnt</code>
  · <img src="docs/preview/icons/locales/morse.svg" width="20" height="20" alt=""> <code>morse</code>
</p>

## Содержание

+ [TypeScript · Quick start](#typescript--quick-start)
+ [Config builder (ANB)](#config-builder-anb)
+ [config.json](#configjson)
+ [Мессенджеры](#мессенджеры)
+ [Визуальный канон](#визуальный-канон)
+ [Плагин (альтернатива)](#плагин-альтернатива)
+ [Legacy Java 5.0.8](#legacy-java-508)
+ [CI cookbook](#ci-cookbook)

## TypeScript · Quick start

| Версия | Стек | Allure | Статус |
|--------|------|--------|--------|
| **4.\*** | Java | Allure 2 | Историческая |
| **5.\*** | Java | Allure 3 | Legacy freeze на **5.0.8** (`legacy/java/`); версии **5.1 нет** |
| **6.\*** | TypeScript | Allure 3 | **Продукт** — pin **6.0.11** (CLI + builder + plugin) |

Патч-ноты → [GitHub Releases](https://github.com/qa-guru/allure-notifications/releases) · миграция → [`MIGRATION.md`](MIGRATION.md).

| Часть | Роль |
|-------|------|
| **CLI** | `npx allure-notifications@6.0.11 send --config …` — основной runtime |
| **Collage PNG** | `@napi-rs/canvas` в `@allure-notifications/core` (Playwright — только тесты) |
| **Config builder** | Web UI → полный `config.json` + free-layout collage — [`apps/builder/`](apps/builder/) |
| **Пакеты** | `@allure-notifications/config` · `pyramid` · `core` · bin `allure-notifications` · plugin `@allure-notifications/plugin` |

После тестов Allure пишет summary. CLI находит его автоматически:

- **Allure 2** — `<allureFolder>/widgets/summary.json`
- **Allure 3** — `<allureFolder>/summary.json`

По summary строится текст уведомления. В режиме collage дополнительно читаются `*-result.json` из `allureResultsFolder`.

```bash
npx allure generate allure-results --clean -o allure-report
npx allure-notifications@6.0.11 send --config config.json --live
```

| Флаг | Поведение |
|------|----------|
| `--dry-run` | Рендер collage; список мессенджеров без сети (PR / локально без секретов) |
| `--mock` | Рендер collage; mock-доставки; **без сети** |
| `--live` | Реальная отправка (Telegram при наличии credentials) |
| `--out <png>` | Записать collage PNG на диск |

Без `--live` / `--mock` по умолчанию безопасный **dry-run**.

## Config builder (ANB)

Web UI: полный `config.json` (`base` · `chart` · `links` · messengers) + редактор free-layout collage.

| | |
|--|--|
| **Prod** | [allure-notifications.qa.guru](https://allure-notifications.qa.guru/) |
| **Project Pages** | [qa-guru.github.io/allure-notifications](https://qa-guru.github.io/allure-notifications/) |
| **Исходники** | [`apps/builder/`](apps/builder/) |
| **Canon** | [`apps/builder/CANON.md`](apps/builder/CANON.md) |

<img width="900" alt="Allure Notifications Builder — desktop" src="readme_images/anb-desktop.png">

Установите как **PWA** (Add to Home Screen / Install) — offline shell и standalone-режим. На iPad Pro 13″:

<img width="420" alt="Allure Notifications Builder — iPad Pro 13" src="readme_images/anb-ipad13pro.png">

### Canvas presets

| Preset | Размер | Заметки |
|--------|--------|--------|
| **SQ-1080** | 1080×1080 | Dense, квадратный canvas |
| **CB-870** | 870×1080 | Canvas под Telegram (post cap 1024×1280) |
| **WD-1410** | 1410×1080 | Широкий canvas |

### Export → CLI

1. Раскладка панелей в builder → **Export** / Download `config.json`.
2. Укажите `base.allureFolder` / `base.allureResultsFolder`.
3. Заполните credentials мессенджера (или env-плейсхолдеры).
4. Отправка:

```bash
npx allure-notifications@6.0.11 send --config <exported>.json
```

## config.json

Схема: [`packages/config`](packages/config) (zod). Удобнее всего Export из [Config builder](#config-builder-anb).

Минимальный пример **6.0** — collage + free + один мессенджер:

```json
{
  "base": {
    "project": "my-project",
    "environment": "ci",
    "comment": "Release smoke · master",
    "language": "ru",
    "allureFolder": "allure-report/",
    "allureResultsFolder": "allure-results/",
    "enableChart": true,
    "darkMode": true,
    "chart": {
      "mode": "collage",
      "layout": "free",
      "width": 870,
      "height": 1080,
      "headerHeight": 56,
      "cardGap": 14,
      "tilePad": 6,
      "gridCols": 10,
      "gridRows": 10,
      "items": [
        { "type": "pie", "x": 0, "y": 0, "w": 5, "h": 4 },
        { "type": "statusDynamics", "x": 5, "y": 0, "w": 5, "h": 4 },
        { "type": "testingPyramid", "x": 0, "y": 4, "w": 4, "h": 3 },
        { "type": "durations", "x": 4, "y": 4, "w": 6, "h": 3, "groupBy": "layer" },
        { "type": "successRateDistribution", "x": 0, "y": 7, "w": 3, "h": 3 },
        { "type": "durationDynamics", "x": 3, "y": 7, "w": 4, "h": 3 },
        { "type": "statusTransitions", "x": 7, "y": 7, "w": 3, "h": 3 }
      ],
      "pyramidFallback": "suites"
    },
    "links": {
      "report": "${ALLURE_REPORT_URL}",
      "dashboard": "${ALLURE_DASHBOARD_URL}",
      "testops": "",
      "build": "${BUILD_URL}"
    }
  },
  "telegram": {
    "token": "${TELEGRAM_BOT_TOKEN}",
    "chat": "${TELEGRAM_CHAT_ID}",
    "topic": "",
    "templatePath": "/templates/telegram.ftl"
  }
}
```

Showcase layout (7-tile readme-hero) = [`config/config.dogfood-telegram-full.json`](config/config.dogfood-telegram-full.json).

### Поля `base`

| Поле | Заметки |
|------|--------|
| `project`, `environment`, `comment` | В тексте уведомления |
| `links` | `report`, `dashboard`, `testops`, `build` — только непустые |
| `reportLink` | **Deprecated** — используйте `links.report` (fallback ещё работает) |
| `language` | `en` / `de` / `fr` / `ru` / `ua` / `by` / `cn` / `cnt` / `morse` |
| `allureFolder` | Каталог сгенерированного отчёта Allure |
| `allureResultsFolder` | Сырые `allure-results` (нужны для analytics collage) |
| `enableChart` | Прикреплять изображение collage / chart |
| `chart.mode` | `collage` (основной) или `pie` |
| `chart.layout` | Основной путь — **`free` + `items`**. Legacy `grid` \| `stacked` \| `row` ещё поддерживаются |
| `chart.width` / `height` | Размер canvas (px) |
| `chart.headerHeight` / `cardGap` / `tilePad` | Chrome карточек (defaults builder: 22 / 14 / 6) |
| `darkMode` | Тема chart |
| `enableSuitesPublishing` | Статистика по suites из `suites.json` |
| `logo`, `durationFormat`, `customData` | Опционально |

## Мессенджеры

Оставьте `base` и только нужный блок мессенджера. `templatePath` — опциональный путь к своему Freemarker-шаблону.

**Telegram** — [wiki](https://github.com/qa-guru/knowledge-base/wiki/12.-Телеграм-бот.-Отправляем-уведомления-о-результатах-прохождения-тестов): `token`, `chat`, опционально `topic` / `replyTo`.

**Slack** — [wiki](https://github.com/qa-guru/allure-notifications/wiki/Slack-configuration): `token`, `chat`, опционально `replyTo`.

**Email** — [wiki](https://github.com/qa-guru/allure-notifications/wiki/Email-configuration): `host`, `port`, `username`, `password`, `from`, `to`, опционально `cc` / `bcc` / `securityProtocol`.

**Mattermost** — [wiki](https://github.com/qa-guru/allure-notifications/wiki/Mattermost-configuration): `url`, `token`, `chat`.

<details>
<summary>Discord</summary>

`botToken`, `channelId`. Developer mode → Discord developer portal → Applications → Bot token; ПКМ по каналу → Copy ID.
</details>

<details>
<summary>Loop</summary>

`webhookUrl` — Integrations → Incoming Webhooks → создать webhook для канала.
</details>

<details>
<summary>Rocket.Chat</summary>

`url`, `auth_token`, `user_id`, `channel`. Токен в настройках пользователя (там же `user_id`).
</details>

<details>
<summary>Zoho Cliq</summary>

`token` (zapikey), `chat`, опционально `bot`, `dataCenter` (`com` / `eu` / `in` / `au` / `jp` / `ca`; default `eu`).
</details>

<details>
<summary>Microsoft Teams</summary>

`webhookUrl` из шаблона Workflows *“Post to a channel when a webhook request is received”* (legacy Office 365 Connectors уходят). Chart — base64; payload ≤ 28 KB; throttle ~4 req/s.
</details>

Опциональный top-level `proxy` (`type`: `http` \| `socks5`, `host`, `port`, …) для исходящего HTTP/SOCKS где поддерживается.

## Визуальный канон

Правила collage и reference PNG: [`docs/canon/CANON.md`](docs/canon/CANON.md).

## Плагин (альтернатива)

Плагин Allure 3 — тонкая обёртка над тем же core. Основной путь — CLI.

```bash
npm add allure @allure-notifications/plugin@6.0.11
```

- Документация: [`packages/plugin/README.md`](packages/plugin/README.md)
- Пример: [`examples/allurerc.notifications.mjs`](examples/allurerc.notifications.mjs)
- GitHub Actions: [`examples/github-actions/`](examples/github-actions/)

## Legacy Java 5.0.8

Только bugfix / security. Сборка: [`legacy/java/`](legacy/java/).

```bash
java -DconfigFile=notifications/config.json -jar allure-notifications-5.0.8.jar
```

Релиз: [v5.0.8](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.8) · заметки 4.x → 5.0: [`docs/migration-5.0.md`](docs/migration-5.0.md).

## CI cookbook

[`docs/ci-cookbook.md`](docs/ci-cookbook.md) · заметки эпохи jar: [`docs/ci-cookbook-5.0.md`](docs/ci-cookbook-5.0.md).
