import { Command } from 'commander'
import pc from 'picocolors'

export const program = new Command()

program
  .name('repoflow')
  .description(pc.bold('Orchestrate multi-repository setups'))
  .version('0.0.1', '-v, --version', 'Print the current version')
