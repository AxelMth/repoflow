# Contributing to repoflow

## Prerequisites

- **Node.js** 22+
- **pnpm** 9+ (`npm i -g pnpm`)

## Setup

```sh
git clone https://github.com/axelmth/repoflow.git
cd repoflow
pnpm install
pnpm build
```

## Running tests

```sh
pnpm test          # run once
pnpm test:watch    # watch mode
```

## Type checking

```sh
pnpm typecheck
```

## Linting and formatting

```sh
pnpm lint          # check for lint errors
pnpm lint:fix      # auto-fix lint errors
pnpm format        # format with Prettier
```

## Creating a changeset

Before opening a PR that changes public API or behaviour, add a changeset:

```sh
pnpm changeset
```

Follow the interactive prompts to select which packages are affected and describe the change. Commit the generated `.changeset/*.md` file alongside your code changes.

## Commit convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cli): add `run` command
fix(core): handle missing config file gracefully
docs: update quickstart example
chore: bump tsup to v8.3
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`.

## Project structure

```
repoflow/
├── packages/
│   ├── core/          # @axelmth/repoflow-core — types and defineConfig
│   ├── cli/           # @axelmth/repoflow — the repoflow binary
│   └── create-repoflow/  # scaffolding tool
├── .changeset/        # pending release changesets
└── .github/workflows/ # CI and release pipelines
```
