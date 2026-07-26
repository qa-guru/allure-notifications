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
6. Git tag `v6.0.0` (GitHub Release) on this line.

### Check before publish

```bash
npm whoami
npm profile get two-factor   # "enabled" if using path A
npm org ls allure-notifications
```

If publish still returns E403: the token is a web-session token (no Bypass 2FA) — replace it with a GAT from step 3B.

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
