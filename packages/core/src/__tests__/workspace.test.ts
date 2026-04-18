import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Workspace } from '../workspace.js'
import { ConfigNotFoundError } from '../config/errors.js'

let tempDir: string

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'repoflow-workspace-test-'))
})

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true })
})

async function makeConfigDir(name: string, configContent: string): Promise<string> {
  const dir = join(tempDir, name)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'repoflow.config.ts'), configContent)
  return dir
}

describe('Workspace.load', () => {
  it('loads workspace from a valid config', async () => {
    const dir = await makeConfigDir(
      'load-valid',
      `export default {
  repos: [
    { name: 'backend', url: 'git@github.com:org/backend.git' },
    { name: 'web', url: 'git@github.com:org/web.git' },
  ],
}`,
    )
    const workspace = await Workspace.load(dir)
    expect(workspace.repos).toHaveLength(2)
    expect(workspace.repos[0]?.name).toBe('backend')
    expect(workspace.repos[1]?.name).toBe('web')
    expect(workspace.config.defaultBranch).toBe('main')
  })

  it('throws ConfigNotFoundError when no config exists', async () => {
    await expect(Workspace.load('/tmp/no-repoflow-config-xyz')).rejects.toThrow(
      ConfigNotFoundError,
    )
  })
})

describe('Workspace.repo', () => {
  it('returns a repo by name', async () => {
    const dir = await makeConfigDir(
      'repo-by-name',
      `export default { repos: [{ name: 'api', url: 'git@github.com:org/api.git' }] }`,
    )
    const workspace = await Workspace.load(dir)
    const repo = workspace.repo('api')
    expect(repo.name).toBe('api')
  })

  it('throws when repo name is not found', async () => {
    const dir = await makeConfigDir(
      'repo-not-found',
      `export default { repos: [{ name: 'api', url: 'u' }] }`,
    )
    const workspace = await Workspace.load(dir)
    expect(() => workspace.repo('nonexistent')).toThrow('nonexistent')
  })
})

describe('Workspace.forEach', () => {
  it('iterates over all repos in order', async () => {
    const dir = await makeConfigDir(
      'foreach',
      `export default {
  repos: [
    { name: 'a', url: 'u' },
    { name: 'b', url: 'u' },
    { name: 'c', url: 'u' },
  ],
}`,
    )
    const workspace = await Workspace.load(dir)
    const visited: string[] = []
    await workspace.forEach(async (repo) => {
      visited.push(repo.name)
    })
    expect(visited).toEqual(['a', 'b', 'c'])
  })
})

describe('Workspace.parallel', () => {
  it('iterates over all repos concurrently', async () => {
    const dir = await makeConfigDir(
      'parallel',
      `export default {
  repos: [
    { name: 'p1', url: 'u' },
    { name: 'p2', url: 'u' },
    { name: 'p3', url: 'u' },
    { name: 'p4', url: 'u' },
    { name: 'p5', url: 'u' },
  ],
}`,
    )
    const workspace = await Workspace.load(dir)
    const visited: string[] = []
    await workspace.parallel(async (repo) => {
      visited.push(repo.name)
    })
    expect(visited.sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
  })
})

describe('Workspace.fromConfig', () => {
  it('constructs repo paths relative to configPath', async () => {
    const dir = await makeConfigDir(
      'from-config',
      `export default { repos: [{ name: 'svc', url: 'u' }], appsDir: './services' }`,
    )
    const workspace = await Workspace.load(dir)
    expect(workspace.repos[0]?.path).toContain('services')
    expect(workspace.repos[0]?.path).toContain('svc')
  })
})
