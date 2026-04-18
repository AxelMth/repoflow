# @axelmth/repoflow

CLI to orchestrate multi-repository setups (meta-repos). Define your repos once, run commands across all of them, and manage releases from a single place — without pulling everything into a monorepo.

> [!WARNING]
> **Status: Pre-alpha** — APIs and CLI commands will change without notice. Not ready for production use.

## Install

```sh
npm i -g @axelmth/repoflow
# or
pnpm add -g @axelmth/repoflow
```

## Quickstart

```sh
cd my-meta-repo
repoflow init        # interactive wizard — generates repoflow.config.ts
repoflow sync        # clone all repos into ./apps/
repoflow status      # branch/dirty/tag table at a glance
```

## Commands

| Command | Description | Key flags |
|---|---|---|
| `repoflow init` | Scaffold `repoflow.config.ts` interactively | — |
| `repoflow sync` | Clone or pull all repos into `./apps/` | `--dry-run` |
| `repoflow status` | Print a branch/status table for all repos | — |
| `repoflow exec <cmd>` | Run a shell command in every repo | `--only <names>`, `--parallel` |
| `repoflow doctor` | Health check the current setup | — |
| `repoflow list` | Print the resolved config (debug) | `--json` |

## Config

`repoflow.config.ts` at the root of your meta-repo:

```ts
import { defineConfig } from '@axelmth/repoflow-core'

export default defineConfig({
  repos: [
    { name: 'backend', url: 'git@github.com:acme/backend.git' },
    { name: 'web',     url: 'git@github.com:acme/web.git' },
    { name: 'infra',   url: 'git@github.com:acme/infra.git', branch: 'prod' },
  ],
  appsDir: './apps',
  defaultBranch: 'main',
})
```

Supports `${ENV_VAR}` interpolation in any string value.

## License

[MIT](https://github.com/axelmth/repoflow/blob/main/LICENSE) — Axel Mathieu-Le Gall
