# npm publish — 6.0.*

Publishable surface (not private) — **org `qa-guru` only** (parity with `@qa-guru/allure-report-kit*`):

| Package | npm name | Role |
|---------|----------|------|
| `packages/config` | `@qa-guru/allure-notifications-config` | schema + catalog |
| `packages/core` | `@qa-guru/allure-notifications-core` | collage PNG (`@napi-rs/canvas`; palette/geometry from `@qa-guru/allure-report-kit`) |
| `packages/cli` | **`@qa-guru/allure-notifications`** | public bin `allure-notifications` → `npx @qa-guru/allure-notifications` |
| `packages/plugin` | `@qa-guru/allure-notifications-plugin` | Allure 3 thin plugin |

Private (not published): `@qa-guru/allure-notifications-monorepo` (root), `@qa-guru/allure-notifications-builder`, `@qa-guru/allure-notifications-test-meta`.

Hard cut (2026-08): former bare `allure-notifications` and `@allure-notifications/*` are **deprecated** — do not publish there.

## Prerequisites

npm (2025+) rejects publish without **2FA on the account** or a **granular access token (GAT) with Bypass 2FA**. A plain `npm login --auth-type=web` session is not enough — you get `E403 … Two-factor authentication or granular access token with bypass 2fa enabled is required`.

### One-time account setup

1. npm user that will own the packages (e.g. `svasenkov`), already in org **`qa-guru`** (same as report-kit).
2. Auth — pick **one**:
   - **A (interactive publish):** enable 2FA at [Account → Two-Factor Auth](https://www.npmjs.com/settings/~/tfa) (`auth-and-writes`), then `npm login --auth-type=web` and enter OTP when prompted; **or**
   - **B (local/CI publish, recommended here):** create a **Granular Access Token** at [Access Tokens](https://www.npmjs.com/settings/~/tokens):
     - Permissions: **Read and write**
     - Packages and scopes: **`@qa-guru`** (or “All packages”)
     - **Bypass two-factor authentication** — **ON**
     - Expiration: short (e.g. 7–30 days) for a release window
     - Put the token in `~/.npmrc` (never commit):

       ```ini
       //registry.npmjs.org/:_authToken=npm_XXXXXXXX
       ```

       or: `npm config set //registry.npmjs.org/:_authToken npm_XXXXXXXX`
3. Verify: `npm whoami` → your user; `npm org ls qa-guru` → you are owner/admin.
4. `pnpm test` green on the release commit.
5. Git tag `v6.0.x` (GitHub Release) on this line.

### Check before publish

```bash
npm whoami
npm profile get two-factor   # "enabled" if using path A
npm org ls qa-guru
```

If publish still returns E403: the token is a web-session token (no Bypass 2FA) — replace it with a GAT from step 2B.

## Publish

From repo root (release branch):

```bash
pnpm install
pnpm test
pnpm run publish:packages
```

`publish:packages` filter order (dependency → consumers):

1. `@qa-guru/allure-notifications-config`
2. `@qa-guru/allure-notifications-core` (depends on `@qa-guru/allure-report-kit` ≥0.3.3 for collage palette)
3. `@qa-guru/allure-notifications` (CLI)
4. `@qa-guru/allure-notifications-plugin`

Equivalent manual sequence:

```bash
pnpm --filter @qa-guru/allure-notifications-config publish --access public --no-git-checks
pnpm --filter @qa-guru/allure-notifications-core publish --access public --no-git-checks
pnpm --filter @qa-guru/allure-notifications publish --access public --no-git-checks
pnpm --filter @qa-guru/allure-notifications-plugin publish --access public --no-git-checks
```

`pnpm` rewrites `workspace:*` → the release version in the published tarball.

## Deprecate abandoned names (one-time after first `@qa-guru` publish)

```bash
npm deprecate allure-notifications@"*" "Moved to @qa-guru/allure-notifications@6.0.14"
npm deprecate @allure-notifications/config@"*" "Moved to @qa-guru/allure-notifications-config@6.0.14"
npm deprecate @qa-guru/allure-notifications-pyramid@"*" "Removed — use @qa-guru/allure-report-kit/collage"
npm deprecate @allure-notifications/pyramid@"*" "Removed — use @qa-guru/allure-report-kit/collage"
npm deprecate @allure-notifications/core@"*" "Moved to @qa-guru/allure-notifications-core@6.0.14"
npm deprecate @allure-notifications/plugin@"*" "Moved to @qa-guru/allure-notifications-plugin@6.0.14"
npm deprecate @allure-notifications/test-meta@"*" "Moved to @qa-guru (private); use monorepo workspace"
```

Do not unpublish live 6.0.x (npm age policy). Org `allure-notifications` is abandoned — no new publishes.

## Consumer

```bash
# primary — CLI pin
npx @qa-guru/allure-notifications@6.2.2 send --config config.json --live

# after local npm i @qa-guru/allure-notifications — bin name unchanged:
npx --no-install allure-notifications send --config config.json --live

# alternate — Allure 3 plugin via allurerc (same version)
# see examples/allurerc.notifications.mjs
```

Secrets unchanged (ADR 008): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_TOPIC_ID`.
