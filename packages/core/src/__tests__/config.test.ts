import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { loadConfig } from '../config/loader.js'
import { ConfigNotFoundError, ConfigValidationError } from '../config/errors.js'
import { resolveEnvVars } from '../config/env.js'
import { applyDefaults } from '../config/defaults.js'
import { RepoflowConfigSchema } from '../config/schema.js'

let tempDir: string

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'repoflow-config-test-'))
})

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true })
})

describe('loadConfig', () => {
  it('loads a valid config and applies defaults', async () => {
    const dir = join(tempDir, 'valid')
    await import('node:fs/promises').then((fs) => fs.mkdir(dir, { recursive: true }))
    await writeFile(
      join(dir, 'repoflow.config.ts'),
      `export default {
  repos: [{ name: 'api', url: 'git@github.com:org/api.git' }],
}`,
    )

    const config = await loadConfig(dir)
    expect(config.repos[0]?.name).toBe('api')
    expect(config.appsDir).toBe('./apps')
    expect(config.defaultBranch).toBe('main')
    expect(config.release.tagStrategy).toBe('semver-rc')
    expect(config.release.requireDraft).toBe(true)
    expect(config.configPath).toContain('repoflow.config.ts')
  })

  it('throws ConfigNotFoundError when no config file exists', async () => {
    await expect(loadConfig('/tmp/nonexistent-repoflow-xyz')).rejects.toThrow(
      ConfigNotFoundError,
    )
  })

  it('throws ConfigValidationError for invalid config shape', async () => {
    const dir = join(tempDir, 'invalid')
    await import('node:fs/promises').then((fs) => fs.mkdir(dir, { recursive: true }))
    await writeFile(
      join(dir, 'repoflow.config.ts'),
      `export default { repos: 'not-an-array' }`,
    )

    await expect(loadConfig(dir)).rejects.toThrow(ConfigValidationError)
  })

  it('throws ConfigValidationError for empty repos array', async () => {
    const dir = join(tempDir, 'empty-repos')
    await import('node:fs/promises').then((fs) => fs.mkdir(dir, { recursive: true }))
    await writeFile(
      join(dir, 'repoflow.config.ts'),
      `export default { repos: [] }`,
    )

    await expect(loadConfig(dir)).rejects.toThrow(ConfigValidationError)
  })

  it('walks up directories to find the config', async () => {
    const parentDir = join(tempDir, 'walk-up')
    const childDir = join(parentDir, 'nested', 'deep')
    await import('node:fs/promises').then((fs) => fs.mkdir(childDir, { recursive: true }))
    await writeFile(
      join(parentDir, 'repoflow.config.ts'),
      `export default { repos: [{ name: 'svc', url: 'git@github.com:org/svc.git' }] }`,
    )

    const config = await loadConfig(childDir)
    expect(config.repos[0]?.name).toBe('svc')
  })
})

describe('applyDefaults', () => {
  it('fills in all optional fields', () => {
    const raw = RepoflowConfigSchema.parse({
      repos: [{ name: 'x', url: 'git@g.com:o/x.git' }],
    })
    const config = applyDefaults(raw, '/fake/path/repoflow.config.ts')
    expect(config.appsDir).toBe('./apps')
    expect(config.defaultBranch).toBe('main')
    expect(config.release.tagStrategy).toBe('semver-rc')
    expect(config.release.requireDraft).toBe(true)
  })

  it('respects user-provided values', () => {
    const raw = RepoflowConfigSchema.parse({
      repos: [{ name: 'x', url: 'git@g.com:o/x.git' }],
      appsDir: './services',
      defaultBranch: 'develop',
    })
    const config = applyDefaults(raw, '/path')
    expect(config.appsDir).toBe('./services')
    expect(config.defaultBranch).toBe('develop')
  })
})

describe('resolveEnvVars', () => {
  it('interpolates env vars in slack config', () => {
    process.env['TEST_CHANNEL'] = 'C123'
    process.env['TEST_TOKEN'] = 'xoxb-test'

    const config = applyDefaults(
      RepoflowConfigSchema.parse({
        repos: [{ name: 'r', url: 'u' }],
        notify: { slack: { channelId: '${TEST_CHANNEL}', botToken: '${TEST_TOKEN}' } },
      }),
      '/path',
    )
    const resolved = resolveEnvVars(config)
    expect(resolved.notify.slack?.channelId).toBe('C123')
    expect(resolved.notify.slack?.botToken).toBe('xoxb-test')

    delete process.env['TEST_CHANNEL']
    delete process.env['TEST_TOKEN']
  })

  it('throws MissingEnvVarError when env var is absent', () => {
    delete process.env['MISSING_VAR']

    const config = applyDefaults(
      RepoflowConfigSchema.parse({
        repos: [{ name: 'r', url: 'u' }],
        notify: { slack: { channelId: '${MISSING_VAR}', botToken: 'token' } },
      }),
      '/path',
    )

    expect(() => resolveEnvVars(config)).toThrow('MISSING_VAR')
  })
})
