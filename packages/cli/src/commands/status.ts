import { Workspace } from '@axelmth/repoflow-core'
import { Command } from 'commander'
import pc from 'picocolors'
import { handleError } from '../utils/errors.js'

export const statusCommand = new Command('status')
  .description('Print a status table of all configured repos')
  .action(async () => {
    try {
      // Dynamic import to avoid issues if cli-table3 types aren't resolved at build time
      const { default: Table } = await import('cli-table3')
      const workspace = await Workspace.load()

      const table = new Table({
        head: ['Name', 'Branch', 'Ahead', 'Behind', 'Dirty', 'Last Tag'].map((h) =>
          pc.bold(h),
        ),
        style: { head: [], border: [] },
      })

      if (workspace.repos.length === 0) {
        console.log(pc.dim('No repos configured. Run: repoflow init'))
        return
      }

      for (const repo of workspace.repos) {
        if (!repo.isPresent) {
          table.push([pc.dim(repo.name), pc.dim('not cloned'), '-', '-', '-', '-'])
          continue
        }

        let statusResult
        let tag: string | null = null
        try {
          statusResult = await repo.status()
          tag = await repo.lastTag()
        } catch {
          table.push([pc.red(repo.name), pc.red('error'), '-', '-', '-', '-'])
          continue
        }

        const color =
          statusResult.dirty ? pc.red : statusResult.ahead > 0 || statusResult.behind > 0
            ? pc.yellow
            : pc.green

        table.push([
          color(repo.name),
          color(statusResult.branch),
          String(statusResult.ahead),
          String(statusResult.behind),
          statusResult.dirty ? pc.red('yes') : pc.green('no'),
          tag ?? pc.dim('—'),
        ])
      }

      console.log(table.toString())
    } catch (e) {
      handleError(e)
    }
  })
