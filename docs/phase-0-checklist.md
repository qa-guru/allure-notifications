# Phase 0 checklist — merge + legacy layout

Do **not** execute big moves until this checklist is explicitly OK'd. Phase 0 = document + skeleton only.

## Layout moves (deferred)

| # | Action | From | To | Done |
|---|--------|------|-----|------|
| 1 | Move Gradle multi-module tree under legacy | repo-root modules (`allure-notifications/`, `allure-notifications-api/`, `build.gradle`, `settings.gradle`, `gradle/`, `gradlew*`) | `legacy/java/` (keep build runnable from that cwd) | [x] |
| 2 | README legacy banner | root README | State **5.0.\* Java legacy** / **6.0.\* TypeScript** active; point jar users at `legacy/java/` | [x] |
| 3 | Merge builder into monorepo | hub clone `allure-notifications-builder/` (or upstream Pages repo) | `apps/builder/` | [x] Stage E |
| 4 | Archive second repo | `qa-guru/allure-notifications-builder` | Archive on GitHub **after** domain cutover (row 5) + separate HQ OK | [ ] after cutover |
| 5 | Pages CNAME / custom domain | builder Pages (`allure.notifications.qa.guru` / live `allure-notifications.qa.guru`) | Serve from `apps/builder/` via [`pages-builder.yml`](../.github/workflows/pages-builder.yml); runbook [`pages-cutover.md`](pages-cutover.md) | [ ] workflow ready; domain switch manual |
| 6 | Stand registry cwd | `projects/allure-notifications-home/allure-notifications-builder` | `projects/allure-notifications-home/allure-notifications/apps/builder` | [x] Stage E |
| 7 | Hub README bootstrap | clone two repos | clone one `allure-notifications`; builder path = `apps/builder/` | [x] post-G hub sync |

## Stand `:3011`

Current (`scripts/stands/registry.json`) — **Stage E**:

- id: `allure-notifications-builder`
- port: `3011`
- cwd: `projects/allure-notifications-home/allure-notifications/apps/builder`
- cmd: `python -m http.server 3011`

```json
"cwd": "projects/allure-notifications-home/allure-notifications/apps/builder"
```

Validate only via:

```bash
python scripts/stands/ensure.py allure-notifications-builder
curl -sf -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3011/
```

Do **not** kill/restart the stand while this chat is active unless the user asks to «погаси».

Hub clone `allure-notifications-builder/` may remain as a mirror until Pages domain cutover + archive (rows 5 then 4); stand cwd is the monorepo path above. Pages **workflow** is ready; custom domain / archive stay `[ ]` until manual GitHub UI steps in [`pages-cutover.md`](pages-cutover.md).

## pnpm skeleton (Phase 0 — done when files exist)

| # | File | Done |
|---|------|------|
| 1 | Root `package.json` (`name`, `version` 6.0.0, `private`) | [x] |
| 2 | `pnpm-workspace.yaml` → `packages/*`, `apps/*` | [x] |
| 3 | `packages/config` minimal stub | [x] |
| 4 | Empty package dirs for later phases (optional stubs) | [ ] pyramid / core / cli — Phase 1+ |

## Must not break during moves

- Java jar build still works under `legacy/java/` until 6.0 dogfood parity
- Builder Playwright tests / dogfood scripts relocate with `apps/builder/`
- Monorepo pin `docs/allure-notifications/VERSION` stays **5.0.8** until cutover
- No `dashboard-overrides` / inject copied into `packages/`

## Sign-off

| Gate | Owner | OK |
|------|-------|----|
| Execute layout moves (rows 1–7) | user | [ ] |
| Start Phase 1 `packages/config` | user | [ ] |
