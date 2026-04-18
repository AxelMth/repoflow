import { describe, expect, it } from 'vitest'
import { program } from '../index.js'

describe('CLI program', () => {
  it('has the correct name', () => {
    expect(program.name()).toBe('repoflow')
  })

  it('registers all expected commands', () => {
    const commands = program.commands.map((c) => c.name())
    expect(commands).toContain('init')
    expect(commands).toContain('sync')
    expect(commands).toContain('status')
    expect(commands).toContain('exec')
    expect(commands).toContain('doctor')
    expect(commands).toContain('list')
  })

  it('has --version flag', () => {
    const versionOpt = program.options.find((o) => o.long === '--version')
    expect(versionOpt).toBeDefined()
  })
})
