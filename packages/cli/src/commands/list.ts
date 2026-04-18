import { Workspace } from '@axelmth/repoflow-core'
import { Command } from 'commander'
import pc from 'picocolors'
import { handleError } from '../utils/errors.js'

export const listCommand = new Command('list')
  .description('Print the parsed repoflow config (useful for debugging)')
  .option('--json', 'Output as JSON')
  .action(async (opts: { json?: boolean }) => {
    try {
      const workspace = await Workspace.load()
      const { config } = workspace

      if (opts.json) {
        console.log(JSON.stringify(config, null, 2))
        return
      }

      console.log(`\n${pc.bold('Meta-repo config')} ${pc.dim(`(${config.configPath})`)}\n`)
      console.log(`  ${pc.dim('appsDir:      ')} ${config.appsDir}`)
      console.log(`  ${pc.dim('defaultBranch:')} ${config.defaultBranch}`)
      console.log(`  ${pc.dim('tagStrategy:  ')} ${config.release.tagStrategy}`)
      console.log(`  ${pc.dim('requireDraft: ')} ${String(config.release.requireDraft)}`)
      console.log(`\n  ${pc.bold(`repos (${config.repos.length}):`)}`)
      for (const r of config.repos) {
        const branch = r.branch ? pc.dim(` → branch: ${r.branch}`) : ''
        console.log(`    ${pc.green('•')} ${pc.bold(r.name)}: ${r.url}${branch}`)
      }
      if (config.notify.slack) {
        console.log(`\n  ${pc.bold('slack:')} ${config.notify.slack.channelId}`)
      }
      console.log()
    } catch (e) {
      handleError(e)
    }
  })
