[![en](https://img.shields.io/badge/lang-en-white.svg)](README.md) [![ru](https://img.shields.io/badge/lang-ru-blue.svg)](#) [![fr](https://img.shields.io/badge/lang-fr-white.svg)](README.fr.md)

# Allure notifications

**Красивые уведомления о прогоне автотестов — прямо в мессенджер.**

Collage PNG + текст со статистикой и ссылками. Соберите `config.json` в [Config builder](#config-builder-anb), отправьте через CLI на TypeScript **6.0.11**.

## Пример уведомления

![Пример уведомления Telegram: collage + статистика + ссылки](docs/notification-example.png)

| Зона | Что внутри |
|------|------------|
| Collage | 7 панелей: pie · status dynamics · pyramid · durations · success rate · duration dynamics · status transitions |
| Текст | окружение, комментарий, duration, счётчики passed / failed / broken / skipped |
| Ссылки | `report` · `dashboard` · `testops` · `build` из `base.links` |

## Omni-tool

([allure-notifications.qa.guru](https://allure-notifications.qa.guru/) · [qa-guru.github.io/allure-notifications](https://qa-guru.github.io/allure-notifications/))

### 1. Messengers

Нет вашего канала? [Issue](https://github.com/qa-guru/allure-notifications/issues/new) или [PR](https://github.com/qa-guru/allure-notifications/compare).

![Telegram](readme_images/icons/messengers/telegram.png) Telegram
· ![Slack](readme_images/icons/messengers/slack.png) Slack
· ![Email](readme_images/icons/messengers/email.png) Email
· ![Mattermost](readme_images/icons/messengers/mattermost.png) Mattermost
· ![Discord](readme_images/icons/messengers/discord.png) Discord
· ![Loop](readme_images/icons/messengers/loop.png) Loop
· ![Rocket.Chat](readme_images/icons/messengers/rocketdotchat.png) Rocket.Chat
· ![Zoho Cliq](readme_images/icons/messengers/zoho.png) Zoho Cliq
· ![Microsoft Teams](readme_images/icons/messengers/microsoftteams.png) Microsoft Teams

### 2. Any CI

Работает везде, где есть Allure results — от ноутбука до hosted CI.

![local](readme_images/icons/ci/local.png) local
· ![GitHub Actions](readme_images/icons/ci/githubactions.png) GitHub Actions
· ![GitLab CI](readme_images/icons/ci/gitlab.png) GitLab CI
· ![AWS CI](readme_images/icons/ci/amazonaws.png) AWS CI
· ![Azure DevOps](readme_images/icons/ci/azuredevops.png) Azure DevOps
· ![Jenkins](readme_images/icons/ci/jenkins.png) Jenkins
· ![Bamboo](readme_images/icons/ci/bamboo.png) Bamboo
· ![Bitbucket Pipelines](readme_images/icons/ci/bitbucket.png) Bitbucket Pipelines
· ![TeamCity](readme_images/icons/ci/teamcity.png) TeamCity
· ![CircleCI](readme_images/icons/ci/circleci.png) CircleCI
· ![Buildkite](readme_images/icons/ci/buildkite.png) Buildkite

…и любой другой runner, который может выполнить CLI.

### 3. Any language with Allure

Адаптеры фреймворков → [список на allurereport.org](https://allurereport.org/docs/frameworks/).

![Java](readme_images/icons/languages/java.png) Java
· ![Kotlin](readme_images/icons/languages/kotlin.png) Kotlin
· ![Groovy](readme_images/icons/languages/groovy.png) Groovy
· ![JavaScript](readme_images/icons/languages/javascript.png) JavaScript
· ![TypeScript](readme_images/icons/languages/typescript.png) TypeScript
· ![Python](readme_images/icons/languages/python.png) Python
· ![C#](readme_images/icons/languages/csharp.png) C#
· ![PHP](readme_images/icons/languages/php.png) PHP
· ![Ruby](readme_images/icons/languages/ruby.png) Ruby
· ![Go](readme_images/icons/languages/go.png) Go
· ![Rust](readme_images/icons/languages/rust.png) Rust
· ![Dart](readme_images/icons/languages/dart.png) Dart

### 4. Notification locales

Нет вашей локали? [Issue](https://github.com/qa-guru/allure-notifications/issues/new) или [PR](https://github.com/qa-guru/allure-notifications/compare).

![en](readme_images/icons/locales/en.png) `en`
· ![de](readme_images/icons/locales/de.png) `de`
· ![fr](readme_images/icons/locales/fr.png) `fr`
· ![ru](readme_images/icons/locales/ru.png) `ru`
· ![by](readme_images/icons/locales/by.png) `by`
· ![ua](readme_images/icons/locales/ua.png) `ua`
· ![cn](readme_images/icons/locales/cn.png) `cn`
· ![cnt](readme_images/icons/locales/cnt.png) `cnt`
· ![morse](readme_images/icons/locales/morse.png) `morse`

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

![Allure Notifications Builder — desktop](readme_images/anb-desktop.png)

Установите как **PWA** (Add to Home Screen / Install) — offline shell и standalone-режим. На iPad Pro 13″:

![Allure Notifications Builder — iPad Pro 13](readme_images/anb-ipad13pro.png)

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
