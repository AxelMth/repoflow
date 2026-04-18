import { describe, expect, it } from 'vitest'
import { defineConfig } from '../config/define.js'

describe('defineConfig', () => {
  it('returns the config unchanged', () => {
    const config = defineConfig({
      repos: [{ name: 'app', url: 'git@github.com:org/app.git' }],
    })
    expect(config.repos[0]?.name).toBe('app')
    expect(config.repos[0]?.url).toBe('git@github.com:org/app.git')
  })

  it('preserves optional fields', () => {
    const config = defineConfig({
      repos: [{ name: 'api', url: 'https://github.com/org/api.git' }],
      appsDir: './services',
      defaultBranch: 'develop',
    })
    expect(config.appsDir).toBe('./services')
    expect(config.defaultBranch).toBe('develop')
  })
})
