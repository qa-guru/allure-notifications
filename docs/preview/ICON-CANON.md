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
| Alignment | Table columns: `icon` \| `name` \| `notes` |

Do **not** mix monochrome + color in one table. Do **not** hotlink random PNGs.

## Paths

```
docs/preview/icons/
  messengers/   telegram slack email mattermost discord loop rocketdotchat zoho microsoftteams
  ci/           local githubactions gitlab jenkins teamcity bamboo circleci azuredevops bitbucket buildkite amazonaws
  languages/    openjdk kotlin apachegroovy javascript typescript python csharp php ruby go rust dart
  locales/      en ru fr ua by cn cnt
```

File names = slug (see mapping below). Zoho Cliq uses `zoho.svg` (no Cliq-specific Simple Icon).

## Provenance

| Set | Source | License | Notes |
|-----|--------|---------|--------|
| Brands (most) | [Simple Icons](https://simpleicons.org) `@v13` via jsDelivr | [CC0-1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md) | Colored with official brand `hex` |
| Brands (removed later) | Simple Icons `@v11` | CC0-1.0 | `microsoftteams`, `azuredevops`, `csharp`, `amazonaws` (dropped from SI ≥ v13) |
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
| `githubactions.svg` | GitHub Actions |
| `gitlab.svg` | GitLab CI |
| `jenkins.svg` | Jenkins |
| `teamcity.svg` | TeamCity |
| `bamboo.svg` | Bamboo |
| `circleci.svg` | CircleCI |
| `azuredevops.svg` | Azure DevOps |
| `bitbucket.svg` | Bitbucket Pipelines |
| `buildkite.svg` | Buildkite |
| `amazonaws.svg` | AWS CI |

### Languages

| File | Label |
|------|--------|
| `openjdk.svg` | Java |
| `kotlin.svg` | Kotlin |
| `apachegroovy.svg` | Groovy |
| `javascript.svg` | JavaScript |
| `typescript.svg` | TypeScript |
| `python.svg` | Python |
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
| `ru.svg` | `ru` | RU |
| `fr.svg` | `fr` | FR |
| `ua.svg` | `ua` | UA |
| `by.svg` | `by` | BY |
| `cn.svg` | `cn` | CN (zh-Hans) |
| `cnt.svg` | `cnt` | TW (zh-Hant) |

No `de` — product does not ship German.

## README embed (later)

Prefer relative SVG (or raw.githubusercontent.com after merge):

```html
<img src="docs/preview/icons/messengers/telegram.svg" width="20" height="20" alt=""> Telegram
```

GitHub markdown table:

```md
| | Messenger | |
|--|--|--|
| <img src="…" width="20" height="20" alt=""> | Telegram | |
```

Shields / emoji flags from the current intro are **not** the Omni-tool canon — replace with these SVGs when promoting.

## Light icons

`javascript` brand yellow is low-contrast on white. Preview CSS uses a light chip behind every icon (`background: #f6f8fa`) so yellow/black logos stay readable. Keep that chip (or equivalent) in README HTML if contrast fails.
