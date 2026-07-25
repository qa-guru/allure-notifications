# npm publish — 6.0.0

Publishable surface (not private):

| Package | npm name | Role |
|---------|----------|------|
| `packages/config` | `@allure-notifications/config` | schema + catalog |
| `packages/pyramid` | `@allure-notifications/pyramid` | palette / geometry |
| `packages/core` | `@allure-notifications/core` | collage PNG (`@napi-rs/canvas`) |
| `packages/cli` | **`allure-notifications`** | public bin → `npx allure-notifications` |

Root workspace package is `@allure-notifications/monorepo` (**private** — not published). `apps/builder` stays private (Pages, not npm).

## Prerequisites

1. `npm login` as owner of the `allure-notifications` name and `@allure-notifications` org (create org on npmjs.com if missing).
2. OTP / 2FA ready for publish.
3. `pnpm test` green on the release commit.
4. Git tag `v6.0.0` (GitHub Release) on this line.

## Publish

From repo root (branch with 6.0.0 packages):

```bash
pnpm install
pnpm test
pnpm run publish:packages
# or, in dependency order:
# pnpm --filter @allure-notifications/config publish --access public --no-git-checks
# pnpm --filter @allure-notifications/pyramid publish --access public --no-git-checks
# pnpm --filter @allure-notifications/core publish --access public --no-git-checks
# pnpm --filter allure-notifications publish --access public --no-git-checks
```

`pnpm` rewrites `workspace:*` → `6.0.0` in the published tarball.

## Consumer

```bash
npx allure-notifications@6.0.0 send --config config.json --live
```

Secrets unchanged (ADR 008): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_TOPIC_ID`.
