import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import simpleGit from 'simple-git'

export type RepoStatus = {
  ahead: number
  behind: number
  dirty: boolean
  branch: string
}

export type CommitInfo = {
  sha: string
  subject: string
  author: string
}

type RepositoryOptions = {
  name: string
  url: string
  path: string
}

export class Repository {
  readonly name: string
  readonly url: string
  readonly path: string

  constructor({ name, url, path }: RepositoryOptions) {
    this.name = name
    this.url = url
    this.path = path
  }

  private get git() {
    return simpleGit({ baseDir: this.path })
  }

  get isPresent(): boolean {
    return existsSync(this.path)
  }

  async clone(): Promise<void> {
    if (this.isPresent) return
    await mkdir(dirname(this.path), { recursive: true })
    await simpleGit().clone(this.url, this.path)
  }

  async pull(): Promise<void> {
    await this.git.pull()
  }

  async checkout(branch: string): Promise<void> {
    await this.git.checkout(branch)
  }

  async currentBranch(): Promise<string> {
    const result = await this.git.branchLocal()
    return result.current || 'HEAD'
  }

  async status(): Promise<RepoStatus> {
    const s = await this.git.status()
    return {
      ahead: s.ahead,
      behind: s.behind,
      dirty: !s.isClean(),
      branch: s.current ?? 'HEAD',
    }
  }

  async lastTag(pattern?: string): Promise<string | null> {
    try {
      const args = ['describe', '--tags', '--abbrev=0']
      if (pattern) args.push(`--match=${pattern}`)
      const result = await this.git.raw(args)
      return result.trim() || null
    } catch {
      return null
    }
  }

  async commitsSince(tag: string): Promise<CommitInfo[]> {
    const log = await this.git.log({ from: tag, to: 'HEAD' })
    return log.all.map((c) => ({
      sha: c.hash.slice(0, 7),
      subject: c.message,
      author: c.author_name,
    }))
  }

  async isClean(): Promise<boolean> {
    const s = await this.git.status()
    return s.isClean()
  }
}
