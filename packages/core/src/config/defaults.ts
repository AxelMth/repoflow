import type { RawConfig } from './schema.js'
import type { ResolvedConfig } from './types.js'

export function applyDefaults(raw: RawConfig, configPath: string): ResolvedConfig {
  return {
    repos: raw.repos,
    appsDir: raw.appsDir ?? './apps',
    defaultBranch: raw.defaultBranch ?? 'main',
    release: {
      tagStrategy: raw.release?.tagStrategy ?? 'semver-rc',
      requireDraft: raw.release?.requireDraft ?? true,
    },
    notify: {
      slack: raw.notify?.slack,
    },
    configPath,
  }
}
