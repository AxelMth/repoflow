import { Command } from 'commander'
import pc from 'picocolors'
import { doctorCommand } from './commands/doctor.js'
import { execCommand } from './commands/exec.js'
import { initCommand } from './commands/init.js'
import { listCommand } from './commands/list.js'
import { statusCommand } from './commands/status.js'
import { syncCommand } from './commands/sync.js'

export const program = new Command()

program
  .name('repoflow')
  .description(pc.bold('Orchestrate multi-repository setups'))
  .version('0.0.1', '-v, --version', 'Print the current version')
  .enablePositionalOptions()

program.addCommand(initCommand)
program.addCommand(syncCommand)
program.addCommand(statusCommand)
program.addCommand(execCommand)
program.addCommand(doctorCommand)
program.addCommand(listCommand)
