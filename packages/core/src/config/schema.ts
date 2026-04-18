import { z } from 'zod'

const RepoConfigSchema = z.object({
  name: z.string().min(1, 'Repo name cannot be empty'),
  url: z.string().min(1, 'Repo URL cannot be empty'),
  branch: z.string().optional(),
  preprodWorkflow: z.string().optional(),
  prodWorkflow: z.string().optional(),
})

const SlackConfigSchema = z.object({
  channelId: z.string().min(1, 'Slack channelId cannot be empty'),
  botToken: z.string().min(1, 'Slack botToken cannot be empty'),
})

export const RepoflowConfigSchema = z.object({
  repos: z.array(RepoConfigSchema).min(1, 'At least one repo is required'),
  appsDir: z.string().optional(),
  defaultBranch: z.string().optional(),
  release: z
    .object({
      tagStrategy: z.literal('semver-rc').optional(),
      requireDraft: z.boolean().optional(),
    })
    .optional(),
  notify: z
    .object({
      slack: SlackConfigSchema.optional(),
    })
    .optional(),
})

export type RawConfig = z.infer<typeof RepoflowConfigSchema>
