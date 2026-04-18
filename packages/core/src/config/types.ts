export type RepoConfig = {
  name: string
  url: string
  branch?: string
}

export type RepoflowConfig = {
  repos: RepoConfig[]
  appsDir?: string
  defaultBranch?: string
  release?: {
    tagStrategy?: 'semver-rc'
    requireDraft?: boolean
  }
  notify?: {
    slack?: {
      channelId: string
      botToken: string
    }
  }
}

export type ResolvedConfig = {
  repos: RepoConfig[]
  appsDir: string
  defaultBranch: string
  release: {
    tagStrategy: 'semver-rc'
    requireDraft: boolean
  }
  notify: {
    slack?: {
      channelId: string
      botToken: string
    }
  }
  configPath: string
}
