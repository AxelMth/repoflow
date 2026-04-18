# @axelmth/repoflow-core

Core library for [repoflow](https://github.com/axelmth/repoflow) — config loading, repository abstractions, and workspace orchestration for multi-repo setups.

> [!WARNING]
> **Status: Pre-alpha** — APIs will change without notice. Not ready for production use.

## Install

```sh
npm i @axelmth/repoflow-core
# or
pnpm add @axelmth/repoflow-core
```

## Usage

### Load config

```ts
import { loadConfig } from '@axelmth/repoflow-core'

const config = await loadConfig() // walks up from cwd to find repoflow.config.ts
```

### Workspace

```ts
import { loadConfig, Workspace } from '@axelmth/repoflow-core'

const config = await loadConfig()
const workspace = await Workspace.fromConfig(config)

// Sequential
await workspace.forEach(async (repo) => {
  console.log(repo.name, await repo.currentBranch())
})

// Parallel (max 4 concurrent)
await workspace.parallel(async (repo) => {
  await repo.pull()
})
```

### Define config (typed helper)

```ts
import { defineConfig } from '@axelmth/repoflow-core'

export default defineConfig({
  repos: [
    { name: 'backend', url: 'git@github.com:acme/backend.git' },
    { name: 'web',     url: 'git@github.com:acme/web.git' },
  ],
  defaultBranch: 'main',
})
```

## API

### `loadConfig(cwd?)`

Walks up the directory tree from `cwd` (default: `process.cwd()`) to find `repoflow.config.ts`, loads it via [tsx](https://github.com/privatenumber/tsx), validates with [zod](https://zod.dev), and applies defaults. Supports `${ENV_VAR}` interpolation.

Throws `ConfigNotFoundError`, `ConfigValidationError`, or `MissingEnvVarError`.

### `Workspace`

| Method | Description |
|---|---|
| `Workspace.load(cwd?)` | Load config then build workspace |
| `Workspace.fromConfig(config)` | Build workspace from already-loaded config |
| `workspace.forEach(fn)` | Run async function sequentially over all repos |
| `workspace.parallel(fn)` | Run async function with max 4 concurrent repos |

### `Repository` (exposed as `Repo`)

| Method/Property | Description |
|---|---|
| `repo.isPresent` | Whether the repo directory exists on disk |
| `repo.clone()` | Clone from `repo.url` into `repo.path` |
| `repo.pull()` | Pull latest on current branch |
| `repo.checkout(branch)` | Checkout branch |
| `repo.status()` | Returns `RepoStatus` (ahead, behind, dirty) |
| `repo.currentBranch()` | Current branch name |
| `repo.lastTag()` | Most recent git tag |
| `repo.commitsSince(ref)` | Commits since a ref |
| `repo.isClean()` | Whether working tree is clean |

## License

[MIT](https://github.com/axelmth/repoflow/blob/main/LICENSE) — Axel Mathieu-Le Gall
