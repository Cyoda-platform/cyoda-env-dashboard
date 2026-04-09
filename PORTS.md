# Development server ports

This file lists the dev-server ports used by the workspaces in this monorepo.
Each port is set in the corresponding `vite.config.ts`.

## Application

| Port   | Workspace                  | Start command                                  |
|--------|----------------------------|------------------------------------------------|
| `5173` | `apps/saas-app`            | `pnpm dev` (alias for `pnpm --filter @cyoda/saas-app dev`) |

`http://localhost:5173` is the canonical URL for the Cyoda Env Dashboard during
local development. The port is set explicitly in `apps/saas-app/vite.config.ts`.

## Packages (standalone development)

Each package can be run on its own dev server. Use this when iterating on a
single package without bringing up `apps/saas-app`.

| Port   | Workspace                                | Start command                                              |
|--------|------------------------------------------|------------------------------------------------------------|
| `3001` | `packages/cobi-react`                    | `pnpm --filter @cyoda/cobi-react dev`                      |
| `3002` | `packages/reporting-react`               | `pnpm --filter @cyoda/reporting-react dev`                 |
| `3008` | `packages/processing-manager-react`      | `pnpm --filter @cyoda/processing-manager-react dev`        |
| `3010` | `packages/tasks-react`                   | `pnpm --filter @cyoda/tasks-react dev`                     |
| `3011` | `packages/cyoda-sass-react`              | `pnpm --filter @cyoda/cyoda-sass-react dev`                |
| `3014` | `packages/statemachine-react`            | `pnpm --filter @cyoda/statemachine-react dev`              |
| `5176` | `packages/source-configuration-react`    | `pnpm --filter @cyoda/source-configuration-react dev`      |

`packages/ui-lib-react` and `packages/http-api-react` are libraries; they have
no standalone dev server.

## Configuration files

| Port   | File                                                          |
|--------|---------------------------------------------------------------|
| `5173` | `apps/saas-app/vite.config.ts`                                |
| `3001` | `packages/cobi-react/vite.config.ts`                          |
| `3002` | `packages/reporting-react/vite.config.ts`                     |
| `3008` | `packages/processing-manager-react/vite.config.ts`            |
| `3010` | `packages/tasks-react/vite.config.ts`                         |
| `3011` | `packages/cyoda-sass-react/vite.config.ts`                    |
| `3014` | `packages/statemachine-react/vite.config.ts`                  |
| `5176` | `packages/source-configuration-react/vite.config.ts`          |

## Rules

1. **Do not change `apps/saas-app`'s port.** `5173` is the canonical local URL
   and is referenced by tests, Auth0 callback URLs, and developer bookmarks.
2. **No two workspaces may share a port.** When adding a new package, pick an
   unused port from this file and update the table.
3. **Standalone packages do not collide with the app.** You can run
   `apps/saas-app` on `5173` while running any package on its own port at the
   same time.

## Adding a new workspace

1. Pick an unused port (check this file).
2. Set `server.port` in the new `vite.config.ts`.
3. Add a row to both tables above.
4. Commit the change in the same PR that adds the workspace.
