import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import simpleGit from 'simple-git'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Repository } from '../repository.js'

let tempDir: string
let sourceDir: string

async function makeSourceRepo(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
  const git = simpleGit(dir)
  await git.init()
  await git.addConfig('user.email', 'test@example.com')
  await git.addConfig('user.name', 'Test User')
  await git.addConfig('commit.gpgsign', 'false')
  await writeFile(join(dir, 'README.md'), '# Test')
  await git.add('.')
  await git.commit('Initial commit')
}

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'repoflow-repo-test-'))
  sourceDir = join(tempDir, 'source')
  await makeSourceRepo(sourceDir)
})

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true })
})

describe('Repository.isPresent', () => {
  it('returns false for a non-existent path', () => {
    const repo = new Repository({ name: 'x', url: 'u', path: '/nonexistent/repoflow/xyz' })
    expect(repo.isPresent).toBe(false)
  })

  it('returns true after clone', async () => {
    const target = join(tempDir, 'present-check')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    expect(repo.isPresent).toBe(true)
  })
})

describe('Repository.clone', () => {
  it('clones from a local path', async () => {
    const target = join(tempDir, 'clone-1')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    expect(existsSync(join(target, 'README.md'))).toBe(true)
  })

  it('is a no-op if the repo is already present', async () => {
    const target = join(tempDir, 'clone-noop')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    await expect(repo.clone()).resolves.toBeUndefined()
  })
})

describe('Repository.status', () => {
  it('reports a clean status on a freshly cloned repo', async () => {
    const target = join(tempDir, 'status-clean')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    const s = await repo.status()
    expect(s.dirty).toBe(false)
    expect(typeof s.branch).toBe('string')
    expect(s.branch.length).toBeGreaterThan(0)
  })

  it('reports dirty when there are untracked files', async () => {
    const target = join(tempDir, 'status-dirty')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    await writeFile(join(target, 'untracked.txt'), 'dirty')
    const s = await repo.status()
    expect(s.dirty).toBe(true)
  })
})

describe('Repository.isClean', () => {
  it('returns true on a clean repo', async () => {
    const target = join(tempDir, 'clean-check')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    expect(await repo.isClean()).toBe(true)
  })

  it('returns false after making changes', async () => {
    const target = join(tempDir, 'dirty-check')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    await writeFile(join(target, 'change.txt'), 'modified')
    expect(await repo.isClean()).toBe(false)
  })
})

describe('Repository.currentBranch', () => {
  it('returns a non-empty branch name', async () => {
    const target = join(tempDir, 'branch-check')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    const branch = await repo.currentBranch()
    expect(typeof branch).toBe('string')
    expect(branch.length).toBeGreaterThan(0)
  })
})

describe('Repository.lastTag', () => {
  it('returns null when there are no tags', async () => {
    const target = join(tempDir, 'notag-check')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    expect(await repo.lastTag()).toBeNull()
  })

  it('returns the tag after one is created', async () => {
    const src = join(tempDir, 'tagged-source')
    await makeSourceRepo(src)
    const git = simpleGit(src)
    await git.addTag('v1.0.0')

    const target = join(tempDir, 'tag-check')
    const repo = new Repository({ name: 'test', url: src, path: target })
    await repo.clone()
    expect(await repo.lastTag()).toBe('v1.0.0')
  })
})

describe('Repository.commitsSince', () => {
  it('returns commits after a given tag', async () => {
    const src = join(tempDir, 'commits-source')
    await makeSourceRepo(src)
    const git = simpleGit(src)
    await git.addTag('v0.1.0')
    await writeFile(join(src, 'feat.txt'), 'new feature')
    await git.add('.')
    await git.commit('feat: add feature')

    const target = join(tempDir, 'commits-check')
    const repo = new Repository({ name: 'test', url: src, path: target })
    await repo.clone()
    const commits = await repo.commitsSince('v0.1.0')
    expect(commits.length).toBeGreaterThan(0)
    expect(commits[0]).toHaveProperty('sha')
    expect(commits[0]).toHaveProperty('subject')
    expect(commits[0]).toHaveProperty('author')
  })
})

describe('Repository.pull', () => {
  it('succeeds on a clean repo with a remote', async () => {
    const target = join(tempDir, 'pull-check')
    const repo = new Repository({ name: 'test', url: sourceDir, path: target })
    await repo.clone()
    await expect(repo.pull()).resolves.toBeUndefined()
  })
})
