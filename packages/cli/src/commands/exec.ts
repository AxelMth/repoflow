import { Workspace } from '@axelmth/repoflow-core'
import { Command } from 'commander'
import { execa } from 'execa'
import pc from 'picocolors'
import { handleError } from '../utils/errors.js'

export const execCommand = new Command('exec')
  .description('Run a shell command in every child repo')
  .argument('<command...>', 'Shell command to run (use -- to separate from repoflow flags)')
  .option('--only <names>', 'Comma-separated list of repo names to target')
  .option('--parallel', 'Run concurrently across repos (default: serial)')
  .passThroughOptions()
  .action(async (args: string[], opts: { only?: string; parallel?: boolean }) => {
    try {
      const workspace = await Workspace.load()

      let repos = workspace.repos
      if (opts.only) {
        const names = opts.only.split(',').map((s) => s.trim())
        repos = repos.filter((r) => names.includes(r.name))
        if (repos.length === 0) {
          console.error(pc.red(`No repos matched: ${opts.only}`))
          process.exit(1)
        }
      }

      const [cmd, ...cmdArgs] = args
      if (!cmd) {
        console.error(pc.red('No command provided'))
        process.exit(1)
      }

      const run = async (repo: (typeof repos)[number]) => {
        console.log(pc.bold(`\n── ${repo.name} ──`))
        try {
          const result = await execa(cmd, cmdArgs, {
            cwd: repo.path,
            all: true,
            reject: false,
          })
          const output = result.all ?? ''
          if (output) {
            console.log(
              output
                .split('\n')
                .map((l) => `  ${l}`)
                .join('\n'),
            )
          }
          if (result.exitCode !== 0) {
            console.log(pc.red(`  Exit: ${result.exitCode}`))
          }
        } catch (e) {
          console.log(pc.red(`  Error: ${e instanceof Error ? e.message : String(e)}`))
        }
      }

      if (opts.parallel) {
        await workspace.parallel(run)
      } else {
        await workspace.forEach(run)
      }
    } catch (e) {
      handleError(e)
    }
  })
