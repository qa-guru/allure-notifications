[![en](https://img.shields.io/badge/lang-en-white.svg)](README.md) [![ru](https://img.shields.io/badge/lang-ru-blue.svg)](#) [![fr](https://img.shields.io/badge/lang-fr-white.svg)](README.fr.md)

# Allure notifications

**Красивые уведомления о прогоне автотестов — прямо в мессенджер.**

Collage PNG + текст со статистикой и ссылками. Соберите `config.json` в [Config builder](#config-builder-anb), отправьте через CLI на TypeScript **6.0.12**.

## Пример уведомления

![Пример уведомления Telegram: collage + статистика + ссылки](docs/notification-example.png)

| Зона | Что внутри |
|------|------------|
| Collage | 7 панелей: current status · status dynamics · pyramid · durations · success rate · duration dynamics · status transitions |
| Текст | окружение, комментарий, duration, счётчики passed / failed / broken / skipped |
| Ссылки | `report` · `dashboard` · `testops` · `build` из `base.links` |

## Omni-tool

([allure-notifications.qa.guru](https://allure-notifications.qa.guru/) · [qa-guru.github.io/allure-notifications](https://qa-guru.github.io/allure-notifications/))

| Ось | Поддержка |
|-----|-----------|
| **Messengers** | <img src="readme_images/icons/messengers/telegram.png" width="16" height="16" alt=""> Telegram · <img src="readme_images/icons/messengers/slack.png" width="16" height="16" alt=""> Slack · <img src="readme_images/icons/messengers/email.png" width="16" height="16" alt=""> Email · <img src="readme_images/icons/messengers/mattermost.png" width="16" height="16" alt=""> Mattermost · <img src="readme_images/icons/messengers/discord.png" width="16" height="16" alt=""> Discord · <img src="readme_images/icons/messengers/loop.png" width="16" height="16" alt=""> Loop · <img src="readme_images/icons/messengers/rocketdotchat.png" width="16" height="16" alt=""> Rocket.Chat · <img src="readme_images/icons/messengers/zoho.png" width="16" height="16" alt=""> Zoho Cliq · <img src="readme_images/icons/messengers/microsoftteams.png" width="16" height="16" alt=""> Microsoft Teams |
| **Any CI** | <img src="readme_images/icons/ci/local.png" width="16" height="16" alt=""> local · <img src="readme_images/icons/ci/githubactions.png" width="16" height="16" alt=""> GitHub Actions · <img src="readme_images/icons/ci/gitlab.png" width="16" height="16" alt=""> GitLab CI · <img src="readme_images/icons/ci/amazonaws.png" width="16" height="16" alt=""> AWS CI · <img src="readme_images/icons/ci/azuredevops.png" width="16" height="16" alt=""> Azure DevOps · <img src="readme_images/icons/ci/jenkins.png" width="16" height="16" alt=""> Jenkins · <img src="readme_images/icons/ci/bamboo.png" width="16" height="16" alt=""> Bamboo · <img src="readme_images/icons/ci/bitbucket.png" width="16" height="16" alt=""> Bitbucket Pipelines · <img src="readme_images/icons/ci/teamcity.png" width="16" height="16" alt=""> TeamCity · <img src="readme_images/icons/ci/circleci.png" width="16" height="16" alt=""> CircleCI · <img src="readme_images/icons/ci/buildkite.png" width="16" height="16" alt=""> Buildkite · …и любой runner, где можно выполнить CLI |
| **Any language with Allure** | <img src="readme_images/icons/languages/java.png" width="16" height="16" alt=""> Java · <img src="readme_images/icons/languages/kotlin.png" width="16" height="16" alt=""> Kotlin · <img src="readme_images/icons/languages/groovy.png" width="16" height="16" alt=""> Groovy · <img src="readme_images/icons/languages/javascript.png" width="16" height="16" alt=""> JavaScript · <img src="readme_images/icons/languages/typescript.png" width="16" height="16" alt=""> TypeScript · <img src="readme_images/icons/languages/python.png" width="16" height="16" alt=""> Python · <img src="readme_images/icons/languages/csharp.png" width="16" height="16" alt=""> C# · <img src="readme_images/icons/languages/php.png" width="16" height="16" alt=""> PHP · <img src="readme_images/icons/languages/ruby.png" width="16" height="16" alt=""> Ruby · <img src="readme_images/icons/languages/go.png" width="16" height="16" alt=""> Go · <img src="readme_images/icons/languages/rust.png" width="16" height="16" alt=""> Rust · <img src="readme_images/icons/languages/dart.png" width="16" height="16" alt=""> Dart · [список фреймворков](https://allurereport.org/docs/frameworks/) |
| **Notification locales** | <img src="readme_images/icons/locales/en.png" width="16" height="16" alt=""> `en` · <img src="readme_images/icons/locales/de.png" width="16" height="16" alt=""> `de` · <img src="readme_images/icons/locales/fr.png" width="16" height="16" alt=""> `fr` · <img src="readme_images/icons/locales/ru.png" width="16" height="16" alt=""> `ru` · <img src="readme_images/icons/locales/by.png" width="16" height="16" alt=""> `by` · <img src="readme_images/icons/locales/ua.png" width="16" height="16" alt=""> `ua` · <img src="readme_images/icons/locales/cn.png" width="16" height="16" alt=""> `cn` · <img src="readme_images/icons/locales/cnt.png" width="16" height="16" alt=""> `cnt` · <img src="readme_images/icons/locales/morse.png" width="16" height="16" alt=""> `morse` |

Нет вашего мессенджера или локали? [Issue](https://github.com/qa-guru/allure-notifications/issues/new) или [PR](https://github.com/qa-guru/allure-notifications/compare).


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
| **6.\*** | TypeScript | Allure 3 | **Продукт** — pin **6.0.12** (CLI + builder + plugin) |

Патч-ноты → [GitHub Releases](https://github.com/qa-guru/allure-notifications/releases) · миграция → [`MIGRATION.md`](MIGRATION.md).

| Часть | Роль |
|-------|------|
| **CLI** | `npx @qa-guru/allure-notifications@6.0.12 send --config …` — основной runtime |
| **Collage PNG** | `@napi-rs/canvas` в `@qa-guru/allure-notifications-core` (Playwright — только тесты) |
| **Config builder** | Web UI → полный `config.json` + free-layout collage — [`apps/builder/`](apps/builder/) |
| **Пакеты** | `@qa-guru/allure-notifications-config` · `pyramid` · `core` · bin `allure-notifications` · plugin `@qa-guru/allure-notifications-plugin` |

После тестов Allure пишет summary. CLI находит его автоматически:

- **Allure 2** — `<allureFolder>/widgets/summary.json`
- **Allure 3** — `<allureFolder>/summary.json`

По summary строится текст уведомления. В режиме collage дополнительно читаются `*-result.json` из `allureResultsFolder`.

```bash
npx allure generate allure-results --clean -o allure-report
npx @qa-guru/allure-notifications@6.0.12 send --config config.json --live
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

Установите как **PWA** (Add to Home Screen / Install) — offline shell и standalone-режим. На iPad Pro 13″ (landscape):

![Allure Notifications Builder — iPad Pro 13 landscape](readme_images/anb-ipad13pro.png)

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
npx @qa-guru/allure-notifications@6.0.12 send --config <exported>.json
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
        { "type": "currentStatus", "x": 0, "y": 0, "w": 5, "h": 4 },
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
  },
  "proxy": {
    "type": "socks5",
    "host": "${PROXY_HOST}",
    "port": 7777,
    "username": "",
    "password": ""
  }
}
```

Showcase layout (7-tile readme-hero) = [`config/config.dogfood-telegram-full.json`](config/config.dogfood-telegram-full.json). SOCKS5-пример: [`config/config.proxy-socks5.example.json`](config/config.proxy-socks5.example.json).

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

Top-level `proxy` (`type`: `http` \| `socks5`, `host`, `port`, опционально `username` / `password`) — исходящий HTTP/SOCKS, где поддерживается.

## Визуальный канон

Правила collage и reference PNG: [`docs/canon/CANON.md`](docs/canon/CANON.md).

## Плагин (альтернатива)

Плагин Allure 3 — тонкая обёртка над тем же core. Основной путь — CLI.

```bash
npm add allure @qa-guru/allure-notifications-plugin@6.0.12
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
