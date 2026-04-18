import { describe, expect, it } from 'vitest'
import { defineConfig } from '../index.js'

describe('core', () => {
  it('placeholder', () => {
    expect(true).toBe(true)
  })

  it('defineConfig returns the config unchanged', () => {
    const config = defineConfig({ repos: { app: { url: 'https://github.com/org/app.git' } } })
    expect(config.repos['app']?.url).toBe('https://github.com/org/app.git')
  })
})
