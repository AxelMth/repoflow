import * as p from '@clack/prompts'
import { Workspace } from '@axelmth/repoflow-core'
import { Command } from 'commander'
import pc from 'picocolors'
import { handleError } from '../utils/errors.js'

export const syncCommand = new Command('sync')
  .description('Clone or pull all configured repos into ./apps/')
  .option('--dry-run', 'Print what would happen without doing it')
  .action(async (opts: { dryRun?: boolean }) => {
    try {
      const workspace = await Workspace.load()
      let hasError = false

      p.intro(pc.bold('repoflow sync'))

      if (workspace.repos.length === 0) {
        p.outro(pc.yellow('No repos configured'))
        return
      }

      for (const repo of workspace.repos) {
        const s = p.spinner()

        if (!repo.isPresent) {
          s.start(`Cloning ${pc.cyan(repo.name)}...`)
          if (!opts.dryRun) {
            try {
              await repo.clone()
              s.stop(`Cloned ${pc.cyan(repo.name)}`)
            } catch (e) {
              s.stop(
                `Failed to clone ${pc.cyan(repo.name)}: ${e instanceof Error ? e.message : String(e)}`,
                1,
              )
              hasError = true
            }
          } else {
            s.stop(`${pc.dim('[dry-run]')} Would clone ${pc.cyan(repo.name)}`)
          }
          continue
        }

        let statusResult
        try {
          statusResult = await repo.status()
        } catch {
          p.log.warn(`${pc.yellow(repo.name)}: could not read git status — skipping`)
          continue
        }

        if (statusResult.dirty) {
          p.log.warn(`${pc.yellow(repo.name)}: dirty working tree — skipping`)
          continue
        }

        s.start(`Pulling ${pc.cyan(repo.name)}...`)
        if (!opts.dryRun) {
          try {
            await repo.pull()
            s.stop(`Pulled ${pc.cyan(repo.name)}`)
          } catch (e) {
            s.stop(
              `Failed to pull ${pc.cyan(repo.name)}: ${e instanceof Error ? e.message : String(e)}`,
              1,
            )
            hasError = true
          }
        } else {
          s.stop(`${pc.dim('[dry-run]')} Would pull ${pc.cyan(repo.name)}`)
        }
      }

      p.outro(
        hasError ? pc.red('Sync completed with errors') : pc.green('All repos synced'),
      )
      process.exit(hasError ? 1 : 0)
    } catch (e) {
      handleError(e)
    }
  })
