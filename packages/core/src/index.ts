export type RepoEntry = {
  url: string
  branch?: string
}

export type RepoflowConfig = {
  repos: Record<string, RepoEntry>
}

export function defineConfig(config: RepoflowConfig): RepoflowConfig {
  return config
}
