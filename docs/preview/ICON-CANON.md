# Icon canon (Omni-tool README draft)

Preview-only. When promoting to prod README, reuse these assets or the same rules.

## Style (locked)

| Knob | Value |
|------|--------|
| Format | **SVG** (`viewBox="0 0 24 24"` for brands/custom; circle-flags native for locales) |
| Color | **Brand color** fill (not monochrome). Locales = full-color flags. |
| Source size | 24×24 logical; ship as SVG (no raster) |
| Display (README target) | **20×20** (`width="20" height="20"`) |
| Display (this preview) | **24×24** |
| Layout | **Adaptive grid** (`auto-fill`, cell min ~96px) — wraps by viewport width; no fixed row count |

Do **not** mix monochrome + color in one strip. Do **not** hotlink random PNGs.

## Paths

```
docs/preview/icons/
  messengers/   telegram slack email mattermost discord loop rocketdotchat zoho microsoftteams
  ci/           local githubactions gitlab amazonaws azuredevops jenkins bamboo bitbucket teamcity circleci buildkite
  languages/    java kotlin groovy javascript typescript python csharp php ruby go rust dart
  locales/      en de fr ru by ua cn cnt morse
```

File names = slug (see mapping below). Zoho Cliq uses `zoho.svg` (no Cliq-specific Simple Icon).

## Provenance

| Set | Source | License | Notes |
|-----|--------|---------|--------|
| Brands (most) | [Simple Icons](https://simpleicons.org) `@v13` via jsDelivr | [CC0-1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md) | Colored with official brand `hex` |
| Brands (removed later) | Simple Icons `@v11` | CC0-1.0 | `microsoftteams`, `azuredevops`, `csharp`, `amazonaws` (dropped from SI ≥ v13) |
| Java, Python | [Devicon](https://github.com/devicons/devicon) `@2.16.0` `*-original.svg` | MIT | Multicolor: classic Java coffee cup, Python blue+yellow |
| Groovy | Devicon `groovy-original` **star paths only** (wordmark stripped) | MIT | Full logo’s script is illegible at 20–24px; keep cyan star + outline |
| GitHub Actions, Jenkins | Devicon `@2.16.0` `*-original.svg` | MIT | SI mono fill flattens workflow diagram / butler; use multicolor originals |
| Email, Local, Loop | Custom SVG in this folder | same as repo (Apache-2.0) | SI `loop` is Frontiers Loop — **wrong** product; do not use |
| Locales | [circle-flags](https://github.com/HatScripts/circle-flags) `@2.7.0` | MIT | Round flags; `cnt` → `tw` (zh-Hant) |

## Slug → label mapping

### Messengers

| File | Label |
|------|--------|
| `telegram.svg` | Telegram |
| `slack.svg` | Slack |
| `email.svg` | Email |
| `mattermost.svg` | Mattermost |
| `discord.svg` | Discord |
| `loop.svg` | Loop |
| `rocketdotchat.svg` | Rocket.Chat |
| `zoho.svg` | Zoho Cliq |
| `microsoftteams.svg` | Microsoft Teams |

### CI

| File | Label |
|------|--------|
| `local.svg` | local |
| `githubactions.svg` | GitHub Actions (Devicon original) |
| `gitlab.svg` | GitLab CI |
| `amazonaws.svg` | AWS CI |
| `azuredevops.svg` | Azure DevOps |
| `jenkins.svg` | Jenkins (Devicon original — full-color butler) |
| `bamboo.svg` | Bamboo |
| `bitbucket.svg` | Bitbucket Pipelines |
| `teamcity.svg` | TeamCity |
| `circleci.svg` | CircleCI |
| `buildkite.svg` | Buildkite |

### Languages

| File | Label |
|------|--------|
| `java.svg` | Java (Devicon original — coffee cup) |
| `kotlin.svg` | Kotlin |
| `groovy.svg` | Groovy (Devicon original — star, not SI wordmark) |
| `javascript.svg` | JavaScript |
| `typescript.svg` | TypeScript |
| `python.svg` | Python (Devicon original — blue + yellow) |
| `csharp.svg` | C# |
| `php.svg` | PHP |
| `ruby.svg` | Ruby |
| `go.svg` | Go |
| `rust.svg` | Rust |
| `dart.svg` | Dart |

### Locales

| File | Code | Flag |
|------|------|------|
| `en.svg` | `en` | GB |
| `de.svg` | `de` | DE |
| `fr.svg` | `fr` | FR |
| `ru.svg` | `ru` | RU |
| `by.svg` | `by` | BY |
| `ua.svg` | `ua` | UA |
| `cn.svg` | `cn` | CN (zh-Hans) |
| `cnt.svg` | `cnt` | TW (zh-Hant) |
| `morse.svg` | `morse` | Custom — dot-dash on dark circle (not a flag) |

## README embed (later)

Prefer relative SVG (or raw.githubusercontent.com after merge). Target shape = **one horizontal line** (wraps on narrow viewports):

```html
<p>
  <img src="…" width="20" height="20" alt=""> Telegram
  · <img src="…" width="20" height="20" alt=""> Slack
  · …
</p>
```

Or HTML flex/grid strip (preview uses `.icon-row` / `.icon-item`). Avoid tall vertical markdown tables for Omni-tool lists.

Shields / emoji flags from the current intro are **not** the Omni-tool canon — replace with these SVGs when promoting.

## Light icons

`javascript` brand yellow is low-contrast on white. Preview CSS uses a light chip behind every icon (`background: #f6f8fa`) so yellow/black logos stay readable. Keep that chip (or equivalent) in README HTML if contrast fails.
