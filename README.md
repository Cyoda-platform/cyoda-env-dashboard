# Cyoda Env Dashboard

> Repository: <https://github.com/Cyoda-platform/cyoda-env-dashboard>

A React + TypeScript monorepo for the Cyoda environment dashboard. The repository
ships a single deployable application — `apps/saas-app` — that composes a set of
feature packages (`packages/*`) into one UI for managing workflows, instances,
tasks, reporting, processing nodes and Trino schemas against a Cyoda backend.

## Repository layout

```
cyoda-env-dashboard/
├── apps/
│   └── saas-app/                  # Deployable application (Vite + React)
├── packages/
│   ├── cli/                       # Internal CLI helpers
│   ├── cobi-react/                # Data mapping (not bundled into saas-app)
│   ├── cyoda-sass-react/          # Trino SQL schema management
│   ├── http-api-react/            # HTTP client, hooks, EntityViewer
│   ├── processing-manager-react/  # Processing node / transition UI
│   ├── reporting-react/           # Reports & catalogue of aliases
│   ├── source-configuration-react/# Source configuration (not bundled)
│   ├── statemachine-react/        # Workflows, instances, state machine
│   ├── tasks-react/               # Task management
│   └── ui-lib-react/              # Shared UI components, layout, theming
├── tools/
│   └── backend-mock-server/       # Optional local mock backend
├── docs/cyoda-cloud/              # OpenAPI specifications
├── e2e/                           # Playwright end-to-end tests
├── scripts/                       # Build / maintenance scripts
├── package.json                   # pnpm workspaces root
├── pnpm-workspace.yaml            # Workspace package globs
├── pnpm-lock.yaml                 # Lockfile (committed)
├── .npmrc                         # pnpm config (hoisted layout, workspace linking)
├── PORTS.md                       # Port assignments for dev servers
└── ENV_FILES_GUIDE.md             # Detailed .env reference
```

The `apps/saas-app` package is the only thing meant to be deployed. Every
`packages/*` workspace can also be run standalone for isolated development on
its own dev-server port (see [PORTS.md](./PORTS.md)).

## Requirements

| Tool         | Version    | Notes                                            |
|--------------|------------|--------------------------------------------------|
| Node.js      | `>= 22`    | Required by all workspaces                       |
| pnpm         | `9.x`      | Pinned via `packageManager`; install via Corepack |
| Git          | any recent |                                                  |

The package manager is **pnpm** — pinned in `package.json`'s
`packageManager` field. Don't use npm or yarn in this repo; they will
create a competing lockfile and break workspace linking.

> If you previously cloned this repo when it used Yarn 4, run
> `find . -name node_modules -prune -exec rm -rf {} +` and delete any
> stray `yarn.lock` before reinstalling with pnpm.

## First-time setup

```bash
# 1. Clone
git clone https://github.com/Cyoda-platform/cyoda-env-dashboard.git
cd cyoda-env-dashboard

# 2. Enable Corepack and activate the pinned pnpm version
corepack enable
corepack prepare pnpm@9.15.4 --activate

# 3. Install all workspace dependencies
pnpm install
```

## Running the app

The default `dev` script in the root starts `apps/saas-app`:

```bash
pnpm dev
# equivalent to: pnpm --filter @cyoda/saas-app dev
```

Vite will start on **http://localhost:5173** (the port configured in
`apps/saas-app/vite.config.ts`).

> **Important:** the app will not start until `apps/saas-app/.env` exists and
> defines `VITE_APP_BASE_URL`. See
> [`apps/saas-app/README.md`](./apps/saas-app/README.md) for the full
> environment configuration walkthrough.

### Other useful root scripts

| Script                  | What it does                                                                  |
|-------------------------|-------------------------------------------------------------------------------|
| `pnpm dev`              | Start the SaaS app dev server                                                 |
| `pnpm dev:all`          | Start every workspace that defines a `dev` script (parallel)                  |
| `pnpm build`            | Build every workspace                                                         |
| `pnpm build:saas`       | Build `apps/saas-app` and all its workspace dependencies in topological order |
| `pnpm test`             | Run the Vitest unit-test suite (watch mode)                                   |
| `pnpm test:run`         | Run Vitest once (CI mode)                                                     |
| `pnpm test:coverage`    | Vitest with coverage                                                          |
| `pnpm test:e2e`         | Run Playwright E2E suite (`e2e/`)                                             |
| `pnpm test:e2e:ui`      | Playwright in interactive UI mode                                             |
| `pnpm lint`             | Run lint in every workspace that defines it                                   |
| `pnpm type-check`       | `tsc --noEmit` in every workspace that defines it                             |
| `pnpm format`           | Prettier across `packages/**`                                                 |
| `pnpm clean`            | Remove `node_modules` everywhere                                              |

### Working on a single package

Each workspace can be run on its own dev server. See [PORTS.md](./PORTS.md) for
the assigned ports. Example:

```bash
pnpm --filter @cyoda/statemachine-react dev   # port 3014
pnpm --filter @cyoda/reporting-react dev      # port 3002
```

Standalone mode reads its own `.env*` files from the package directory; it does
**not** use `apps/saas-app/.env`.

## Backend connection

`apps/saas-app` talks to a real Cyoda backend through the Vite dev-server proxy.
The proxy targets are derived from `VITE_APP_BASE_URL` in `apps/saas-app/.env`
and rewritten in `apps/saas-app/vite.config.ts`. Proxied path prefixes:

- `/api` → `${VITE_APP_BASE_URL}`
- `/platform-api` → `${VITE_APP_BASE_URL}/api/platform-api`
- `/platform-processing` → `${VITE_APP_API_BASE}` (resolved API target)
- `/platform-common` → resolved API target
- `/auth` → resolved API target

A local mock backend is available for offline work:

```bash
cd tools/backend-mock-server
npm install
npm start
```

## Authentication

The app uses Auth0. You need a working tenant configured via the
`VITE_APP_AUTH0_*` variables in `apps/saas-app/.env`. See
[`apps/saas-app/README.md`](./apps/saas-app/README.md#auth0).

## Testing

- **Unit tests** — Vitest, configured at the repository root
  (`vitest.config.ts`). Run with `pnpm test`.
- **E2E tests** — Playwright, configured at the repository root
  (`playwright.config.ts`); specs live under `e2e/`. Run with `pnpm test:e2e`.

E2E tests rely on `TEST_ENV_USER` / `TEST_ENV_SECRET` from
`apps/saas-app/.env`.

## Documentation

- [`PORTS.md`](./PORTS.md) — port assignments for the app and standalone packages
- [`ENV_FILES_GUIDE.md`](./ENV_FILES_GUIDE.md) — full reference for `.env` files
- [`apps/saas-app/README.md`](./apps/saas-app/README.md) — setup and run the app
- `docs/cyoda-cloud/` — backend OpenAPI specifications
- Each `packages/*` workspace has its own README with package-specific notes

## Tech stack

React 18 · TypeScript 5 · Vite 6 · Ant Design 5 · React Router 6 ·
TanStack Query · Zustand · Auth0 · Vitest · Playwright · pnpm 9 workspaces.

## License

Private — Cyoda. See [`LICENSE`](./LICENSE).
