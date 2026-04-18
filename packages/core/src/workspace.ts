import { dirname, join, resolve } from 'node:path'
import { loadConfig } from './config/loader.js'
import type { ResolvedConfig } from './config/types.js'
import { Repository } from './repository.js'

export class Workspace {
  constructor(
    readonly config: ResolvedConfig,
    readonly repos: Repository[],
  ) {}

  static async load(cwd?: string): Promise<Workspace> {
    const config = await loadConfig(cwd)
    return Workspace.fromConfig(config)
  }

  static fromConfig(config: ResolvedConfig): Workspace {
    const configDir = dirname(config.configPath)
    const appsDir = resolve(configDir, config.appsDir)
    const repos = config.repos.map(
      (r) => new Repository({ name: r.name, url: r.url, path: join(appsDir, r.name) }),
    )
    return new Workspace(config, repos)
  }

  repo(name: string): Repository {
    const r = this.repos.find((r) => r.name === name)
    if (!r) throw new Error(`Repository "${name}" not found in config`)
    return r
  }

  async forEach(fn: (repo: Repository) => Promise<void>): Promise<void> {
    for (const repo of this.repos) {
      await fn(repo)
    }
  }

  async parallel(fn: (repo: Repository) => Promise<void>): Promise<void> {
    const MAX = 4
    const queue = [...this.repos]
    const workers = Array.from({ length: Math.min(MAX, queue.length) }, async () => {
      let repo: Repository | undefined
      while ((repo = queue.shift()) !== undefined) {
        await fn(repo)
      }
    })
    await Promise.all(workers)
  }
}
