# Cyoda SaaS App

`@cyoda/saas-app` is the deployable application of the
[`cyoda-env-dashboard`](../../README.md) monorepo. It composes the feature
packages from `packages/*` into a single React + Vite UI for managing
workflows, instances, tasks, reporting, processing nodes and Trino schemas
against a Cyoda backend.

This README walks through running the app **standalone from a terminal, with
no IDE**, on macOS.

---

## 1. Prerequisites (macOS)

You need three things on your machine: **Node.js 22+**, **Corepack-managed
pnpm 9.x**, and **Git**.

### 1.1 Install Homebrew (if you don't already have it)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the post-install hint Homebrew prints to add `brew` to your `PATH`.

### 1.2 Install Node.js 22

The simplest path is via Homebrew:

```bash
brew install node@22
brew link --overwrite --force node@22
node -v   # should print v22.x.x
```

If you prefer multiple Node versions, use `nvm` instead:

```bash
brew install nvm
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

nvm install 22
nvm use 22
```

### 1.3 Enable pnpm 9 via Corepack

The repo is pinned to **pnpm 9** in `package.json`'s `packageManager`
field. Corepack ships with Node ≥ 16 — use it to install the pinned
version:

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm -v   # should print 9.15.4
```

> **Do not install pnpm through Homebrew or `npm install -g pnpm`.** Use
> Corepack so the version stays in sync with the repo's `packageManager`
> field — anyone cloning the repo gets the same pnpm version automatically.

### 1.4 Install Git (if missing)

```bash
brew install git
```

---

## 2. Clone and install dependencies

All commands are run from the repository root, **not** from this directory:

```bash
git clone https://github.com/Cyoda-platform/cyoda-env-dashboard.git
cd cyoda-env-dashboard
pnpm install
```

`pnpm install` resolves every workspace under `packages/*` and `apps/*`
(declared in `pnpm-workspace.yaml`) and links them locally. The first
install will take a minute or two; subsequent installs are nearly instant
because pnpm hard-links from a global content-addressable store.

> **Use pnpm, not npm or yarn.** The lockfile is `pnpm-lock.yaml` and
> `package.json` pins `packageManager: pnpm@9.x`. Mixing in `npm install`
> or `yarn install` will create a competing lockfile and break workspace
> linking.

---

## 3. Configure environment variables

The app **will not start** until `apps/saas-app/.env` exists and defines
`VITE_APP_BASE_URL` (this is enforced in `apps/saas-app/vite.config.ts`).

### 3.1 Create your `.env`

A template is provided. Copy it:

```bash
cp apps/saas-app/.env.template apps/saas-app/.env
```

Then open `apps/saas-app/.env` in your editor of choice and fill in the
values. Reference for every variable below.

### 3.2 Variable reference

> ### ⚠️ The `VITE_` prefix means *public*
>
> Every variable whose name starts with `VITE_` is **inlined into the
> client-side JavaScript bundle** by Vite at build time and shipped to
> every browser that loads the app. There is no such thing as a secret
> `VITE_*` variable.
>
> - **Safe to put behind `VITE_`:** API base URLs, Auth0 client IDs,
>   audiences and organization IDs (Auth0 designs SPA client IDs to be
>   public — security comes from the Allowed Callback URLs and PKCE,
>   not from hiding the ID), feature flags.
> - **Never put behind `VITE_`:** API keys, passwords, signing keys,
>   refresh tokens, database credentials, or anything you wouldn't post
>   on a billboard. Specifically: do **not** put a real Grafana API key
>   into `VITE_APP_GRAFANA_API_KEY` — anyone using the app will be able
>   to read it out of the bundle. Proxy Grafana calls through a backend
>   that holds the key server-side instead.
>
> Variables without the `VITE_` prefix (e.g. `TEST_ENV_USER`,
> `TEST_ENV_SECRET`) are **not** bundled into the browser. Vite ignores
> them at build time; only Node-side tooling (Playwright, scripts) sees
> them. They are still in plaintext in `.env`, so don't commit `.env`
> and don't put production credentials there either.

#### Backend / API

| Variable                       | Required | Purpose                                                                                                |
|--------------------------------|:--------:|--------------------------------------------------------------------------------------------------------|
| `VITE_APP_BASE_URL`            | yes      | Root URL of the Cyoda backend (e.g. `https://client-xxxxx-dev.eu.cyoda.net`). Used by the Vite proxy. |
| `VITE_APP_API_BASE`            | yes      | Path under the API host. For dev with the Vite proxy use `/api`.                                       |
| `VITE_APP_API_BASE_PROCESSING` | yes      | Processing API path. For dev with the Vite proxy use `/api`.                                           |
| `VITE_PROXY_LOG`               | no       | `true` to log every proxied request to stdout. Defaults to `false`.                                    |
| `VITE_APP_DEBUG`               | no       | Enable extra debug logging in the app. Defaults to `false`.                                            |

#### Auth0

The app authenticates via Auth0. Get these values from your Cyoda Auth0
tenant administrator.

| Variable                      | Required | Purpose                                                  |
|-------------------------------|:--------:|----------------------------------------------------------|
| `VITE_APP_AUTH0_DOMAIN`       | yes      | Auth0 tenant domain (e.g. `auth.cyoda.net`).             |
| `VITE_APP_AUTH0_CLIENT_ID`    | yes      | Auth0 application client ID.                             |
| `VITE_APP_AUTH0_AUDIENCE`     | yes      | Auth0 API audience (e.g. `https://cloud.cyoda.com/api`). |
| `VITE_APP_AUTH0_ORGANIZATION` | no       | Auth0 organization ID, if your tenant uses orgs.         |

> The Auth0 application's **Allowed Callback URLs**, **Allowed Logout URLs**
> and **Allowed Web Origins** must include `http://localhost:5173`, otherwise
> the login redirect will fail.

#### Feature flags

| Variable                                  | Default | Effect                                              |
|-------------------------------------------|:-------:|-----------------------------------------------------|
| `VITE_FEATURE_FLAG_USE_MODELS_INFO`       | `true`  | Enable extended models information in the UI.      |
| `VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON`| `true`  | Render the Entity Viewer in JSON mode.             |
| `VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA`      | `true`  | Show the Trino SQL Schema section in the menu.     |
| `VITE_FEATURE_FLAG_CHATBOT`               | `false` | Enable the chatbot panel.                           |
| `VITE_FEATURE_FLAG_IS_CYODA_CLOUD`        | `true`  | Enable Cyoda Cloud-specific behavior.               |

#### Grafana (optional)

| Variable                          | Required | Purpose                                          |
|-----------------------------------|:--------:|--------------------------------------------------|
| `VITE_APP_GRAFANA_API_URL`        | no       | Grafana API base URL.                            |
| `VITE_APP_GRAFANA_API_KEY`        | no       | **Do not put a real key here.** See the security warning above — this value is bundled into the browser. Leave the placeholder, or proxy Grafana calls through a backend. |
| `VITE_APP_GRAFANA_SERVER_SOURCE_ID`| no      | Grafana datasource ID.                           |

#### E2E test credentials

| Variable          | Required | Purpose                                       |
|-------------------|:--------:|-----------------------------------------------|
| `TEST_ENV_USER`   | for E2E  | Username used by Playwright tests.            |
| `TEST_ENV_SECRET` | for E2E  | Password used by Playwright tests.            |

### 3.3 Local-only overrides

For machine-specific tweaks (e.g. enabling a feature flag just on your
laptop), create `apps/saas-app/.env.development.local`:

```bash
VITE_FEATURE_FLAG_CHATBOT=true
```

`*.local` files are git-ignored. Vite loads them with higher priority than
the base `.env`.

---

## 4. Start the app

From the **repository root**:

```bash
pnpm dev
```

This is an alias for `pnpm --filter @cyoda/saas-app dev`, which runs
`vite` inside `apps/saas-app`. Vite will print:

```
  VITE v6.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. You will be redirected to
Auth0 to log in, then dropped on `/workflows` (the default route).

To stop the dev server: `Ctrl+C`.

### Running directly from this directory

If you prefer:

```bash
cd apps/saas-app
pnpm dev
```

This is equivalent — Vite resolves the workspace links via the root
`node_modules`.

---

## 5. Production build

```bash
# From the repository root — builds dependencies first, then the app,
# in topological order (pnpm --filter ...@cyoda/saas-app)
pnpm build:saas
```

The output is written to `apps/saas-app/dist/`. To preview the built
bundle locally:

```bash
pnpm --filter @cyoda/saas-app preview
```

For a hand-rolled deployment, serve `apps/saas-app/dist/` with any static
file server (`nginx`, `serve`, `caddy`, S3+CloudFront, etc.). Make sure your
web server rewrites unknown routes to `index.html` so React Router can take
over client-side routing.

In production, set `VITE_APP_API_BASE` (and the other API variables) to
absolute URLs — there is no Vite proxy outside of `vite dev`.

---

## 6. How the dev-server proxy works

`apps/saas-app/vite.config.ts` rewrites the following path prefixes onto the
backend defined by `VITE_APP_BASE_URL`:

| Local prefix           | Forwarded to                                         |
|------------------------|------------------------------------------------------|
| `/api/*`               | `${VITE_APP_BASE_URL}/api/*`                         |
| `/platform-api/*`      | `${VITE_APP_BASE_URL}/api/platform-api/*`            |
| `/platform-processing/*`| resolved API target                                 |
| `/platform-common/*`   | resolved API target                                 |
| `/auth/*`              | resolved API target                                  |

Set `VITE_PROXY_LOG=true` in your `.env` to see every proxied request in
the dev-server console.

If you don't have access to a real Cyoda backend, the repo ships a mock
server:

```bash
cd tools/backend-mock-server
npm install
npm start
```

Point `VITE_APP_BASE_URL` at it (typically `http://localhost:8080`) and
restart `pnpm dev`.

---

## 7. Application structure

```
apps/saas-app/
├── index.html
├── public/
├── src/
│   ├── main.tsx                  # Entry point, Auth0 + QueryClient setup
│   ├── App.tsx                   # Top-level providers
│   ├── components/
│   │   ├── AppLayout.tsx         # Outer layout (sidebar + content)
│   │   ├── AppHeader.tsx         # Header with entity-type toggle
│   │   ├── LeftSideMenu.tsx      # Navigation tree
│   │   ├── Auth0TokenInitializer.tsx
│   │   ├── RefineLayout.tsx
│   │   └── dialogs/
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── Login.tsx
│   ├── routes/
│   │   └── index.tsx             # All route definitions (lazy loaded)
│   └── mocks/
├── e2e/                          # App-specific Playwright specs
├── .env.template                 # Copy to .env to get started
├── vite.config.ts
├── tsconfig.json
└── package.json
```

The app's routes (defined in `src/routes/index.tsx`) lazy-load the feature
packages so that each section is its own bundle:

| Route                           | Source package                       |
|---------------------------------|--------------------------------------|
| `/workflows`, `/instances`, `/state/:id`, `/transition/:id`, … | `@cyoda/statemachine-react` |
| `/reporting/*`                  | `@cyoda/reporting-react`             |
| `/tasks`, `/tasks/:id`          | `@cyoda/tasks-react`                 |
| `/trino`, `/trino/schema/:id`   | `@cyoda/cyoda-sass-react`            |
| `/processing-ui/*`              | `@cyoda/processing-manager-react`    |
| `/entity-viewer`                | `@cyoda/ui-lib-react`                |

The Trino and Tasks sections only render when their feature flags are on.

---

## 8. Tests

### End-to-end (Playwright)

```bash
# From repo root — uses the root playwright.config.ts and the e2e/ folder
pnpm test:e2e
pnpm test:e2e:ui      # interactive
pnpm test:e2e:headed  # see the browser

# Or the app's local Playwright config
pnpm --filter @cyoda/saas-app test:e2e
```

E2E tests use `TEST_ENV_USER` and `TEST_ENV_SECRET` from
`apps/saas-app/.env`. The dev server must be running, or Playwright will
start one as configured.

### Unit tests

Vitest is configured at the repository root:

```bash
pnpm test          # watch mode
pnpm test:run      # single run
pnpm test:coverage # with coverage
```

### Type checking

```bash
pnpm --filter @cyoda/saas-app type-check
```

---

## 9. Troubleshooting

**`Error: VITE_APP_BASE_URL is not set in .env file.`**
You haven't created `apps/saas-app/.env`, or `VITE_APP_BASE_URL` is empty
inside it. See [§3](#3-configure-environment-variables).

**`pnpm: command not found` or wrong pnpm version**
```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm -v  # must print 9.15.4 (or whatever packageManager pins)
```

**Login redirects fail / Auth0 error in browser**
The Auth0 application must allow `http://localhost:5173` as a callback,
logout URL and web origin. Check the Auth0 dashboard.

**Stale dependencies after a pull**
```bash
pnpm install
# or, full reset:
pnpm clean
pnpm install
```

**`@cyoda/...` resolves to a 404 from `nexus.cyoda.com`**
Your global `~/.npmrc` routes the `@cyoda` scope to a private Nexus
registry, but for this monorepo `@cyoda/*` packages must come from the
local workspace. The repo's `.npmrc` already sets
`link-workspace-packages=deep` to handle this — make sure you didn't
accidentally remove it.

**Port 5173 already in use**
Another process is bound to it. Kill it (`lsof -i :5173`, then `kill <pid>`)
— do not change the port, it is the canonical URL (see
[`PORTS.md`](../../PORTS.md)).

**API requests return 404 / CORS errors**
Confirm `VITE_APP_BASE_URL` is reachable (`curl -I "$VITE_APP_BASE_URL/api"`)
and set `VITE_PROXY_LOG=true` in your `.env` to see what the proxy is
forwarding.

---

## 10. Reference

- [Repository README](../../README.md)
- [`PORTS.md`](../../PORTS.md) — port assignments
- [`ENV_FILES_GUIDE.md`](../../ENV_FILES_GUIDE.md) — full `.env` reference
- `docs/cyoda-cloud/` — backend OpenAPI specifications
