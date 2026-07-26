# npm publish — 6.0.*

Publishable surface (not private):

| Package | npm name | Role |
|---------|----------|------|
| `packages/config` | `@allure-notifications/config` | schema + catalog |
| `packages/pyramid` | `@allure-notifications/pyramid` | palette / geometry |
| `packages/core` | `@allure-notifications/core` | collage PNG (`@napi-rs/canvas`) |
| `packages/cli` | **`allure-notifications`** | public bin → `npx allure-notifications` |
| `packages/plugin` | `@allure-notifications/plugin` | Allure 3 thin plugin (Phase 5) — first public cut with **6.0.5** |

Root workspace package is `@allure-notifications/monorepo` (**private** — not published). `apps/builder` stays private (Pages, not npm).

## Prerequisites

npm (2025+) rejects publish without **2FA on the account** or a **granular access token (GAT) with Bypass 2FA**. A plain `npm login --auth-type=web` session is not enough — you get `E403 … Two-factor authentication or granular access token with bypass 2fa enabled is required`.

### One-time account setup

1. npm user that will own the packages (e.g. `svasenkov`).
2. Create org **`allure-notifications`** → [npmjs.com/org/create](https://www.npmjs.com/org/create)  
   (scope `@allure-notifications` does not exist until the org exists; CLI `npm org` only manages members).
3. Auth — pick **one**:
   - **A (interactive publish):** enable 2FA at [Account → Two-Factor Auth](https://www.npmjs.com/settings/~/tfa) (`auth-and-writes`), then `npm login --auth-type=web` and enter OTP when prompted; **or**
   - **B (local/CI publish, recommended here):** create a **Granular Access Token** at [Access Tokens](https://www.npmjs.com/settings/~/tokens):
     - Permissions: **Read and write**
     - Packages and scopes: `@allure-notifications` + package `allure-notifications` (or “All packages” if you prefer)
     - **Bypass two-factor authentication** — **ON**
     - Expiration: short (e.g. 7–30 days) for a release window
     - Put the token in `~/.npmrc` (never commit):

       ```ini
       //registry.npmjs.org/:_authToken=npm_XXXXXXXX
       ```

       or: `npm config set //registry.npmjs.org/:_authToken npm_XXXXXXXX`
4. Verify: `npm whoami` → your user; `npm org ls allure-notifications` → you are owner/admin.
5. `pnpm test` green on the release commit.
6. Git tag `v6.0.x` (GitHub Release) on this line.

### Check before publish

```bash
npm whoami
npm profile get two-factor   # "enabled" if using path A
npm org ls allure-notifications
```

If publish still returns E403: the token is a web-session token (no Bypass 2FA) — replace it with a GAT from step 3B.

## Publish

From repo root (release branch with bumped `6.0.x` packages):

```bash
pnpm install
pnpm test
pnpm run publish:packages
```

`publish:packages` already includes **plugin**. pnpm filter order (dependency → consumers):

1. `@allure-notifications/config`
2. `@allure-notifications/pyramid`
3. `@allure-notifications/core`
4. `allure-notifications` (CLI bin)
5. `@allure-notifications/plugin`

Equivalent manual sequence:

```bash
pnpm --filter @allure-notifications/config publish --access public --no-git-checks
pnpm --filter @allure-notifications/pyramid publish --access public --no-git-checks
pnpm --filter @allure-notifications/core publish --access public --no-git-checks
pnpm --filter allure-notifications publish --access public --no-git-checks
pnpm --filter @allure-notifications/plugin publish --access public --no-git-checks
```

`pnpm` rewrites `workspace:*` → the release version in the published tarball.

**6.0.5 note:** first release that publishes `@allure-notifications/plugin` (CLI + scoped libs already on npm through 6.0.4). Do not publish plugin alone without the matching CLI/core cut.

**6.0.7 note (plugin-only):** npm `6.0.6` is broken (`exports`-only, no `main`). Publish only `@allure-notifications/plugin@6.0.7`; CLI/libs stay at **6.0.5**. Skip `publish:packages` for this cut — use:

```bash
pnpm --filter @allure-notifications/plugin publish --access public --no-git-checks
```

## Consumer

```bash
# primary — CLI pin from docs/allure-notifications/VERSION
npx allure-notifications@6.0.5 send --config config.json --live

# alternate (after 6.0.5) — Allure 3 plugin via allurerc
# see examples/allurerc.notifications.mjs
```

Secrets unchanged (ADR 008): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_TOPIC_ID`.
