# repoflow

**repoflow** orchestrates multi-repository setups (meta-repositories) through a shared CI/CD pipeline. Define your repos once, run commands across all of them, and manage releases from a single place — without pulling everything into a monorepo.

> [!WARNING]
> **Status: Pre-alpha** — This project is in active early development. APIs, CLI commands, and configuration formats will change without notice. Not ready for production use.

## Why repoflow?

[meta](https://github.com/mateodelnorte/meta) pioneered the meta-repository pattern, but hasn't seen significant updates since 2020. repoflow is a ground-up rewrite for the modern JS ecosystem:

- **pnpm workspaces** — fast, disk-efficient package management across repos
- **GitHub Actions** — first-class CI/CD integration with reusable workflows
- **TypeScript** — fully typed configuration and programmatic API
- **ESM-first** — no CommonJS legacy, built for Node 20+
- **Changesets** — structured versioning and changelog management

## Install

> Once published to npm:

```sh
# npm
npm i -D @axelmth/repoflow

# pnpm
pnpm add -D @axelmth/repoflow
```

## Quickstart

### 1. Scaffold your meta-repo

```sh
# Scaffolding via npm create — coming in v1 release
# For now, install the CLI and run init:
npm i -g @axelmth/repoflow
cd my-meta-repo
repoflow init
```

The `init` wizard will ask for your repo list and generate a `repoflow.config.ts`.

### 2. Clone all repos

```sh
repoflow sync
```

This clones every configured repo into `./apps/<name>`. If a repo is already cloned, it pulls the latest changes instead.

### 3. Check status at a glance

```sh
repoflow status
```

Prints a table showing each repo's branch, ahead/behind count, dirty flag, and last tag.

### 4. Run commands everywhere

```sh
# Run pnpm install in every repo
repoflow exec -- pnpm install

# Run only in specific repos
repoflow exec --only backend,web -- git log --oneline -5

# Run in parallel
repoflow exec --parallel -- pnpm build
```

### 5. Health check

```sh
repoflow doctor
```

Verifies Node version, pnpm availability, config validity, all repos cloned, default branch alignment, and no dirty working trees.

## Commands

| Command | Description | Key flags |
|---|---|---|
| `repoflow init` | Scaffold `repoflow.config.ts` interactively | — |
| `repoflow sync` | Clone or pull all repos into `./apps/` | `--dry-run` |
| `repoflow status` | Print a branch/status table for all repos | — |
| `repoflow exec <cmd>` | Run a shell command in every repo | `--only <names>`, `--parallel` |
| `repoflow doctor` | Health check the current setup | — |
| `repoflow list` | Print the resolved config (debug) | `--json` |

## Config file reference

`repoflow.config.ts` at the root of your meta-repo:

```ts
import { defineConfig } from '@axelmth/repoflow-core'

export default defineConfig({
  // Required: list of child repos
  repos: [
    { name: 'backend', url: 'git@github.com:acme/backend.git' },
    { name: 'web',     url: 'git@github.com:acme/web.git' },
    // optional: per-repo branch override
    { name: 'infra',   url: 'git@github.com:acme/infra.git', branch: 'prod' },
  ],

  // Where to clone repos (default: './apps')
  appsDir: './apps',

  // Default branch for all repos (default: 'main')
  defaultBranch: 'main',

  // Release settings (used in prompt 3 — release flow)
  release: {
    tagStrategy: 'semver-rc', // only supported value in v1
    requireDraft: true,       // human clicks Publish before release goes live
  },

  // Optional: Slack notifications (prompt 3)
  notify: {
    slack: {
      // Supports ${ENV_VAR} interpolation
      channelId: '${SLACK_RELEASES_CHANNEL_ID}',
      botToken:  '${SLACK_BOT_TOKEN}',
    },
  },
})
```

## Packages

| Package | Description | Version |
|---|---|---|
| [`@axelmth/repoflow-core`](./packages/core) | Core types, `defineConfig`, config loading, `Repository` + `Workspace` classes | ![npm](https://img.shields.io/npm/v/@axelmth/repoflow-core) |
| [`@axelmth/repoflow`](./packages/cli) | CLI entrypoint (`repoflow` binary) | ![npm](https://img.shields.io/npm/v/@axelmth/repoflow) |
| [`create-repoflow`](./packages/create-repoflow) | Scaffolding tool (`npm create repoflow`) | ![npm](https://img.shields.io/npm/v/create-repoflow) |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, commit conventions, and how to submit changesets.

## License

[MIT](./LICENSE) — Axel Mathieu-Le Gall
