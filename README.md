[![en](https://img.shields.io/badge/lang-en-blue.svg)](#) [![ru](https://img.shields.io/badge/lang-ru-white.svg)](README.ru.md) [![fr](https://img.shields.io/badge/lang-fr-white.svg)](README.fr.md)

# Allure notifications

**Beautiful test-run notifications — right in your messenger.**

Collage PNG + caption with statistics and links. Build `config.json` in the [Config builder](#config-builder-anb), send with the TypeScript CLI **6.0.11**.

## Notification example

![Telegram notification example: collage + statistics + links](docs/notification-example.png)

| Zone | Contents |
|------|----------|
| Collage | 7 panels: pie · status dynamics · pyramid · durations · success rate · duration dynamics · status transitions |
| Text | environment, comment, duration, passed / failed / broken / skipped counters |
| Links | `report` · `dashboard` · `testops` · `build` from `base.links` |

## Omni-tool

([allure-notifications.qa.guru](https://allure-notifications.qa.guru/) · [qa-guru.github.io/allure-notifications](https://qa-guru.github.io/allure-notifications/))

### 1. Messengers

Missing yours? [Open an issue](https://github.com/qa-guru/allure-notifications/issues/new) or [send a PR](https://github.com/qa-guru/allure-notifications/compare).

<div style="display:flex;flex-wrap:wrap;gap:8px 4px;align-items:flex-start;padding:10px 8px;border:1px solid #d0d7de;border-radius:8px;background:#fff;margin:8px 0 16px">
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/telegram.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Telegram</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/slack.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Slack</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/email.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Email</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/mattermost.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Mattermost</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/discord.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Discord</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/loop.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Loop</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/rocketdotchat.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Rocket.Chat</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/zoho.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Zoho Cliq</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/messengers/microsoftteams.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Microsoft Teams</span></span>
</div>

### 2. Any CI

Runs anywhere Allure results exist — local laptop to hosted CI.

<div style="display:flex;flex-wrap:wrap;gap:8px 4px;align-items:flex-start;padding:10px 8px;border:1px solid #d0d7de;border-radius:8px;background:#fff;margin:8px 0 16px">
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/local.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">local</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/githubactions.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">GitHub Actions</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/gitlab.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">GitLab CI</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/amazonaws.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">AWS CI</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/azuredevops.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Azure DevOps</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/jenkins.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Jenkins</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/bamboo.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Bamboo</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/bitbucket.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Bitbucket Pipelines</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/teamcity.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">TeamCity</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/circleci.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">CircleCI</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/ci/buildkite.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Buildkite</span></span>
</div>

…and any other runner that can execute the CLI.

### 3. Any language with Allure

Framework adapters → [frameworks list](https://allurereport.org/docs/frameworks/).

<div style="display:flex;flex-wrap:wrap;gap:8px 4px;align-items:flex-start;padding:10px 8px;border:1px solid #d0d7de;border-radius:8px;background:#fff;margin:8px 0 16px">
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/java.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Java</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/kotlin.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Kotlin</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/groovy.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Groovy</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/javascript.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">JavaScript</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/typescript.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">TypeScript</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/python.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Python</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/csharp.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">C#</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/php.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">PHP</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/ruby.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Ruby</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/go.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Go</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/rust.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Rust</span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/languages/dart.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25">Dart</span></span>
</div>

### 4. Notification locales

Missing a locale? [Open an issue](https://github.com/qa-guru/allure-notifications/issues/new) or [send a PR](https://github.com/qa-guru/allure-notifications/compare).

<div style="display:flex;flex-wrap:wrap;gap:8px 4px;align-items:flex-start;padding:10px 8px;border:1px solid #d0d7de;border-radius:8px;background:#fff;margin:8px 0 16px">
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/en.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>en</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/de.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>de</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/fr.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>fr</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/ru.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>ru</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/by.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>by</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/ua.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>ua</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/cn.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>cn</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/cnt.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>cnt</code></span></span>
<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-start;width:88px;gap:4px;text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #d0d7de;border-radius:8px;background:#f6f8fa"><img src="readme_images/icons/locales/morse.png" width="24" height="24" alt=""></span><span style="font-size:12px;font-weight:600;line-height:1.25"><code>morse</code></span></span>
</div>


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

![Allure Notifications Builder — desktop](readme_images/anb-desktop.png)

Install as a **PWA** (Add to Home Screen / Install) for offline shell and standalone display. On iPad Pro 13″ (landscape):

![Allure Notifications Builder — iPad Pro 13 landscape](readme_images/anb-ipad13pro.png)

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
