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

> Coming soon — this section will be filled in once the core API stabilizes in prompt 2.

## Packages

| Package | Description | Version |
|---|---|---|
| [`@axelmth/repoflow-core`](./packages/core) | Core types, `defineConfig`, and shared utilities | ![npm](https://img.shields.io/npm/v/@axelmth/repoflow-core) |
| [`@axelmth/repoflow`](./packages/cli) | CLI entrypoint (`repoflow` binary) | ![npm](https://img.shields.io/npm/v/@axelmth/repoflow) |
| [`create-repoflow`](./packages/create-repoflow) | Scaffolding tool (`npm create repoflow`) | ![npm](https://img.shields.io/npm/v/create-repoflow) |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, commit conventions, and how to submit changesets.

## License

[MIT](./LICENSE) — Axel Mathieu-Le Gall
