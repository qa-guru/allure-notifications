[![en](https://img.shields.io/badge/lang-en-blue.svg)](#) [![ru](https://img.shields.io/badge/lang-ru-white.svg)](README.ru.md) [![fr](https://img.shields.io/badge/lang-fr-white.svg)](README.fr.md)

# Allure notifications

**Beautiful test-run notifications — right in your messenger.**

Collage PNG + caption with statistics and links. Build `config.json` in the [Config builder](#config-builder-anb), send with the TypeScript CLI **6.0.11**.

## Notification example

<img width="488" alt="Telegram notification example: collage + statistics + links" src="docs/notification-example.png">

| Zone | Contents |
|------|----------|
| Collage | 7 panels: pie · status dynamics · pyramid · durations · success rate · duration dynamics · status transitions |
| Text | environment, comment, duration, passed / failed / broken / skipped counters |
| Links | `report` · `dashboard` · `testops` · `build` from `base.links` |

## Omni-tool

([allure-notifications.qa.guru](https://allure-notifications.qa.guru/) · [qa-guru.github.io/allure-notifications](https://qa-guru.github.io/allure-notifications/))

### 1. Messengers

Missing yours? [Open an issue](https://github.com/qa-guru/allure-notifications/issues/new) or [send a PR](https://github.com/qa-guru/allure-notifications/compare).

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

Runs anywhere Allure results exist — local laptop to hosted CI.

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

…and any other runner that can execute the CLI.

### 3. Any language with Allure

Framework adapters → [frameworks list](https://allurereport.org/docs/frameworks/).

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

Missing a locale? [Open an issue](https://github.com/qa-guru/allure-notifications/issues/new) or [send a PR](https://github.com/qa-guru/allure-notifications/compare).

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

## Table of contents

+ [TypeScript · Quick start](#typescript--quick-start)
+ [Config builder (ANB)](#config-builder-anb)
+ [config.json](#configjson)
+ [Messengers](#messengers)
+ [Visual canon](#visual-canon)
+ [Plugin (alternate)](#plugin-alternate)
+ [Legacy Java 5.0.8](#legacy-java-508)
+ [CI cookbook](#ci-cookbook)

## TypeScript · Quick start

| Version | Stack | Allure | Status |
|---------|-------|--------|--------|
| **4.\*** | Java | Allure 2 | Historical |
| **5.\*** | Java | Allure 3 | Legacy freeze at **5.0.8** (`legacy/java/`); there is **no 5.1** |
| **6.\*** | TypeScript | Allure 3 | **Product** — pin **6.0.11** (CLI + builder + plugin) |

Older patch notes → [GitHub Releases](https://github.com/qa-guru/allure-notifications/releases) · migration → [`MIGRATION.md`](MIGRATION.md).

| Piece | Role |
|-------|------|
| **CLI** | `npx allure-notifications@6.0.11 send --config …` — primary runtime |
| **Collage PNG** | `@napi-rs/canvas` in `@allure-notifications/core` (Playwright = tests only) |
| **Config builder** | Web UI → full `config.json` + free-layout collage — [`apps/builder/`](apps/builder/) |
| **Packages** | `@allure-notifications/config` · `pyramid` · `core` · bin `allure-notifications` · plugin `@allure-notifications/plugin` |

After tests finish, Allure writes a summary. The CLI finds it automatically:

- **Allure 2** — `<allureFolder>/widgets/summary.json`
- **Allure 3** — `<allureFolder>/summary.json`

Summary drives notification text. In collage mode the CLI also reads `*-result.json` from `allureResultsFolder`.

```bash
npx allure generate allure-results --clean -o allure-report
npx allure-notifications@6.0.11 send --config config.json --live
```

| Flag | Behavior |
|------|----------|
| `--dry-run` | Render collage; list messengers that *would* send; **no network** |
| `--mock` | Render collage; mock deliveries; **no network** |
| `--live` | Actually send (Telegram when credentials are set) |
| `--out <png>` | Write collage PNG to disk |

Default without `--live` / `--mock` is safe **dry-run**.

## Config builder (ANB)

Web UI that exports a full `config.json` (`base` · `chart` · `links` · messengers) with a free-layout collage editor.

| | |
|--|--|
| **Prod** | [allure-notifications.qa.guru](https://allure-notifications.qa.guru/) |
| **Project Pages** | [qa-guru.github.io/allure-notifications](https://qa-guru.github.io/allure-notifications/) |
| **Source** | [`apps/builder/`](apps/builder/) |
| **Canon** | [`apps/builder/CANON.md`](apps/builder/CANON.md) |

<img width="900" alt="Allure Notifications Builder — desktop" src="readme_images/anb-desktop.png">

Install as a **PWA** (Add to Home Screen / Install) for offline shell and standalone display. On iPad Pro 13″:

<img width="420" alt="Allure Notifications Builder — iPad Pro 13" src="readme_images/anb-ipad13pro.png">

### Canvas presets

| Preset | Size | Notes |
|--------|------|--------|
| **SQ-1080** | 1080×1080 | Dense square canvas |
| **CB-870** | 870×1080 | Telegram-oriented editor canvas (post cap 1024×1280) |
| **WD-1410** | 1410×1080 | Wide canvas |

### Export → CLI

1. Arrange panels in the builder → **Export** / Download `config.json`.
2. Point `base.allureFolder` / `base.allureResultsFolder` at your report and results.
3. Fill messenger credentials (or env placeholders).
4. Send:

```bash
npx allure-notifications@6.0.11 send --config <exported>.json
```

## config.json

Schema: [`packages/config`](packages/config) (zod). Prefer Export from the [Config builder](#config-builder-anb).

Minimal **6.0** example — collage + free layout + one messenger:

```json
{
  "base": {
    "project": "my-project",
    "environment": "ci",
    "comment": "Release smoke · master",
    "language": "en",
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

### `base` fields

| Field | Notes |
|-------|--------|
| `project`, `environment`, `comment` | Shown in notification text |
| `links` | `report`, `dashboard`, `testops`, `build` — only non-empty links appear |
| `reportLink` | **Deprecated** — use `links.report` (still accepted as fallback) |
| `language` | `en` / `de` / `fr` / `ru` / `ua` / `by` / `cn` / `cnt` / `morse` |
| `allureFolder` | Generated Allure report directory |
| `allureResultsFolder` | Raw `allure-results` (needed for collage analytics) |
| `enableChart` | Attach collage / chart image |
| `chart.mode` | `collage` (primary) or `pie` |
| `chart.layout` | **`free` + `items`** is the main path. Legacy `grid` \| `stacked` \| `row` still supported |
| `chart.width` / `height` | Canvas size (px) |
| `chart.headerHeight` / `cardGap` / `tilePad` | Card chrome (builder defaults: 22 / 14 / 6) |
| `darkMode` | Chart theme |
| `enableSuitesPublishing` | Per-suite stats from `suites.json` when present |
| `logo`, `durationFormat`, `customData` | Optional |

## Messengers

Keep `base` and only the messenger block you need. Optional `templatePath` points to a custom Freemarker template.

**Telegram** — [wiki](https://github.com/qa-guru/knowledge-base/wiki/12.-Телеграм-бот.-Отправляем-уведомления-о-результатах-прохождения-тестов): `token`, `chat`, optional `topic` / `replyTo`.

**Slack** — [wiki](https://github.com/qa-guru/allure-notifications/wiki/Slack-configuration): `token`, `chat`, optional `replyTo`.

**Email** — [wiki](https://github.com/qa-guru/allure-notifications/wiki/Email-configuration): `host`, `port`, `username`, `password`, `from`, `to`, optional `cc` / `bcc` / `securityProtocol`.

**Mattermost** — [wiki](https://github.com/qa-guru/allure-notifications/wiki/Mattermost-configuration): `url`, `token`, `chat`.

<details>
<summary>Discord</summary>

`botToken`, `channelId`. Enable Developer mode → Discord developer portal → Applications → Bot token; right-click channel → Copy ID.
</details>

<details>
<summary>Loop</summary>

`webhookUrl` — Integrations → Incoming Webhooks → create webhook for the channel.
</details>

<details>
<summary>Rocket.Chat</summary>

`url`, `auth_token`, `user_id`, `channel`. Generate token in user settings (also yields `user_id`).
</details>

<details>
<summary>Zoho Cliq</summary>

`token` (zapikey), `chat`, optional `bot`, `dataCenter` (`com` / `eu` / `in` / `au` / `jp` / `ca`; default `eu`).
</details>

<details>
<summary>Microsoft Teams</summary>

`webhookUrl` from the Workflows app template *“Post to a channel when a webhook request is received”* (legacy Office 365 Connectors are retiring). Chart embeds as base64; payload ≤ 28 KB; ~4 req/s throttle.
</details>

Optional top-level `proxy` (`type`: `http` \| `socks5`, `host`, `port`, …) for outbound HTTP/SOCKS where supported.

## Visual canon

Locked collage rules and reference PNG: [`docs/canon/CANON.md`](docs/canon/CANON.md).

## Plugin (alternate)

Allure 3 plugin — thin wrapper over the same core pipeline. CLI remains primary.

```bash
npm add allure @allure-notifications/plugin@6.0.11
```

- Docs: [`packages/plugin/README.md`](packages/plugin/README.md)
- Example: [`examples/allurerc.notifications.mjs`](examples/allurerc.notifications.mjs)
- GitHub Actions sample: [`examples/github-actions/`](examples/github-actions/)

## Legacy Java 5.0.8

Bugfix / security only. Build: [`legacy/java/`](legacy/java/).

```bash
java -DconfigFile=notifications/config.json -jar allure-notifications-5.0.8.jar
```

Release: [v5.0.8](https://github.com/qa-guru/allure-notifications/releases/tag/v5.0.8) · 4.x → 5.0 notes: [`docs/migration-5.0.md`](docs/migration-5.0.md).

## CI cookbook

[`docs/ci-cookbook.md`](docs/ci-cookbook.md) · jar-era notes: [`docs/ci-cookbook-5.0.md`](docs/ci-cookbook-5.0.md).
