import { access, constants } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { applyDefaults } from './defaults.js'
import { ConfigNotFoundError, ConfigValidationError } from './errors.js'
import { resolveEnvVars } from './env.js'
import { RepoflowConfigSchema } from './schema.js'
import type { ResolvedConfig } from './types.js'

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function findConfigFile(start: string): Promise<string | null> {
  let dir = resolve(start)
  while (true) {
    const candidate = join(dir, 'repoflow.config.ts')
    if (await fileExists(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

function unwrapModule(mod: unknown): unknown {
  if (mod === null || typeof mod !== 'object') return mod
  const m = mod as Record<string, unknown>
  if (!('default' in m)) return mod
  const def = m['default']
  // tsx CJS interop: default = { __esModule: true, default: actualExport }
  if (def !== null && typeof def === 'object' && '__esModule' in (def as object)) {
    return (def as Record<string, unknown>)['default'] ?? def
  }
  return def
}

export async function loadConfig(cwd = process.cwd()): Promise<ResolvedConfig> {
  const configPath = await findConfigFile(cwd)
  if (!configPath) throw new ConfigNotFoundError(cwd)

  let rawModule: unknown
  try {
    const { tsImport } = await import('tsx/esm/api')
    rawModule = await tsImport(pathToFileURL(configPath).href, pathToFileURL(configPath).href)
  } catch (e) {
    if (e instanceof ConfigValidationError) throw e
    throw new ConfigValidationError(
      `Failed to parse repoflow.config.ts: ${e instanceof Error ? e.message : String(e)}`,
    )
  }

  // tsImport wraps CJS interop: mod.default = { __esModule: true, default: actualConfig }
  const rawConfig = unwrapModule(rawModule)

  const result = RepoflowConfigSchema.safeParse(rawConfig)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new ConfigValidationError(`Invalid repoflow.config.ts:\n${issues}`)
  }

  const withDefaults = applyDefaults(result.data, configPath)
  return resolveEnvVars(withDefaults)
}
