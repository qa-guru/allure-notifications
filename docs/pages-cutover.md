# GitHub Pages cutover — `apps/builder/` → custom domain

**Status:** domain cutover **done** · archive **done** ([`.github/workflows/pages-builder.yml`](../.github/workflows/pages-builder.yml)).  
Prod: [`allure-notifications.qa.guru`](https://allure-notifications.qa.guru/) on this repo. Second builder repo archived (checklist rows 5 → 4).

| Item | Value |
|------|--------|
| Source (target) | `qa-guru/allure-notifications` → static from `apps/builder/` (`index.html`, `css/`, `js/` emit from `src/`, `vendor/`) |
| Workflow | `.github/workflows/pages-builder.yml` — `tsc` build + vendor sync → artifact; push `master` + `feature/6.0*` + `feature/builder-ts` (path-filtered) or `workflow_dispatch` |
| Project URL (after Pages enabled) | `https://qa-guru.github.io/allure-notifications/` |
| **Prod** | Custom domain **`allure-notifications.qa.guru`** on this repo (LE SSL · Enforce HTTPS) · DNS → `qa-guru.github.io` |
| Archived second repo | [qa-guru/allure-notifications-builder](https://github.com/qa-guru/allure-notifications-builder) — `isArchived=true` (row 4) |
| Checklist / old label | `allure.notifications.qa.guru` — **DNS leftover**; cutover kept hyphen hostname |
| Secrets | **none** (no Telegram) |

Relative asset paths in `index.html` work on both project URL and custom domain (no `<base>` hack).

---

## A. Enable Pages on this repo (prep — safe before domain move)

Do this in GitHub UI on **`qa-guru/allure-notifications`** (does **not** steal the custom domain yet):

1. **Settings → Pages**
2. **Build and deployment → Source** = **GitHub Actions** (not “Deploy from a branch”).
3. Ensure environment **`github-pages`** exists (first workflow run creates it; approve if protection rules require it).
4. On branch `feature/6.0*`, run **Actions → Pages (builder) → Run workflow**, or push a change under `apps/builder/`.
5. Wait for green deploy. Check:
   - Actions run success
   - [https://qa-guru.github.io/allure-notifications/](https://qa-guru.github.io/allure-notifications/) returns **2xx** and loads builder UI (preview, panel bar, export controls)

Until step B, leave custom domain on the **old** builder repo so prod hostname stays up.

---

## B. Custom domain cutover (manual — checklist row 5)

**Order matters:** a hostname can only be attached to **one** GitHub Pages site.

1. **Hostname default:** keep **`allure-notifications.qa.guru`** (current DNS/TLS). Do **not** point prod at leftover `allure.notifications.qa.guru` unless HQ explicitly wants that rename.
2. **Old repo** `qa-guru/allure-notifications-builder` → **Settings → Pages** → remove Custom domain → Save.  
   (Optional: disable Pages on that repo after smoke on the new site.)
3. **New repo** `qa-guru/allure-notifications` → **Settings → Pages** → Custom domain = `allure-notifications.qa.guru` → Save.
4. Wait for DNS check + TLS (“DNS check successful” / certificate **ready**).  
   Hyphen hostname: DNS already `CNAME` → `qa-guru.github.io` — usually **no DNS change**.
5. **Enforce HTTPS** when certificate is ready (Pages checkbox) — only after green padlock.
6. Confirm artifact `CNAME` matches (`pages-builder.yml` writes `allure-notifications.qa.guru`).
7. **Verify** (row 5 → `[x]` only when all pass):
   - `curl -sfI https://allure-notifications.qa.guru/` → **2xx**
   - Browser: builder loads; static `css` / `js` / `vendor` 200
   - Optional: compare smoke vs local stand `:3011` (`python scripts/stands/ensure.py allure-notifications-builder`)

**Do not** change DNS/SSL in GitHub UI from automation without explicit HQ OK. This doc is the runbook only.

---

## C. Archive second repo (checklist row 4 — **after** B) — **done**

HQ OK after domain cutover; executed:

1. Bookmarks / hub README prod → [`allure-notifications.qa.guru`](https://allure-notifications.qa.guru/).
2. `gh repo archive qa-guru/allure-notifications-builder` → `isArchived=true` (repo not deleted).
3. phase-0-checklist row **4** `[x]`.

---

## What stays out of this cutover

- `ci-6.0.yml` / Java `build.yml` — unchanged
- Live Telegram / consumer `VERSION` pin (**5.0.8**)
- npm publish / merge `master`
- Matrix / other monorepo zones
