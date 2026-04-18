import {
  ConfigNotFoundError,
  ConfigValidationError,
  MissingEnvVarError,
  Workspace,
  loadConfig,
} from '@axelmth/repoflow-core'
import { Command } from 'commander'
import { execa } from 'execa'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import pc from 'picocolors'

function check(ok: boolean, label: string, fix?: string): boolean {
  console.log(`${ok ? pc.green('✓') : pc.red('✗')} ${label}`)
  if (!ok && fix) console.log(pc.dim(`  → ${fix}`))
  return ok
}

function warn(label: string, fix?: string): void {
  console.log(`${pc.yellow('⚠')} ${label}`)
  if (fix) console.log(pc.dim(`  → ${fix}`))
}

async function commandExists(cmd: string): Promise<boolean> {
  try {
    await execa(cmd, ['--version'], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

export const doctorCommand = new Command('doctor')
  .description('Run health checks and report problems')
  .action(async () => {
    const cwd = process.cwd()
    let allOk = true

    console.log(pc.bold('\nrepoflow doctor\n'))

    // Node version
    const major = parseInt(process.version.slice(1), 10)
    allOk =
      check(major >= 20, `Node.js >= 20 (found ${process.version})`, 'Install Node.js 20+') &&
      allOk

    // pnpm
    allOk =
      check(await commandExists('pnpm'), 'pnpm is available', 'npm i -g pnpm') && allOk

    // gh (warning only)
    if (await commandExists('gh')) {
      check(true, 'gh CLI is available')
    } else {
      warn('gh CLI not found (optional)', 'https://cli.github.com')
    }

    // Config file
    const configPath = join(cwd, 'repoflow.config.ts')
    const configExists = existsSync(configPath)
    allOk = check(configExists, 'repoflow.config.ts exists', 'Run: repoflow init') && allOk

    if (!configExists) {
      console.log(allOk ? pc.green('\nAll checks passed') : pc.red('\nSome checks failed'))
      process.exit(allOk ? 0 : 1)
    }

    // Config validity + env vars
    let config
    try {
      config = await loadConfig(cwd)
      check(true, 'repoflow.config.ts is valid')
      check(true, 'All required env vars are set')
    } catch (e) {
      if (e instanceof MissingEnvVarError) {
        check(true, 'repoflow.config.ts is valid')
        allOk =
          check(false, `Missing env var: ${e.varName}`, `Set ${e.varName} in your environment`) &&
          allOk
      } else if (e instanceof ConfigValidationError) {
        allOk = check(false, `Config invalid: ${e.message}`) && allOk
      } else if (e instanceof ConfigNotFoundError) {
        allOk = check(false, 'Config not found', 'Run: repoflow init') && allOk
      } else {
        allOk =
          check(false, `Config error: ${e instanceof Error ? e.message : String(e)}`) && allOk
      }
      config = null
    }

    if (!config) {
      console.log(allOk ? pc.green('\nAll checks passed') : pc.red('\nSome checks failed'))
      process.exit(allOk ? 0 : 1)
    }

    // Repos
    const workspace = Workspace.fromConfig(config)

    for (const repo of workspace.repos) {
      allOk =
        check(repo.isPresent, `${repo.name} is cloned`, 'Run: repoflow sync') && allOk
    }

    for (const repo of workspace.repos) {
      if (!repo.isPresent) continue
      try {
        const branch = await repo.currentBranch()
        const repoConfig = config.repos.find((r) => r.name === repo.name)
        const expected = repoConfig?.branch ?? config.defaultBranch
        allOk =
          check(
            branch === expected,
            `${repo.name} is on ${expected} (current: ${branch})`,
            `cd apps/${repo.name} && git checkout ${expected}`,
          ) && allOk
      } catch {
        allOk = check(false, `${repo.name}: failed to read branch`) && allOk
      }
    }

    for (const repo of workspace.repos) {
      if (!repo.isPresent) continue
      try {
        const clean = await repo.isClean()
        allOk =
          check(
            clean,
            `${repo.name} has no uncommitted changes`,
            `cd apps/${repo.name} && git stash`,
          ) && allOk
      } catch {
        allOk = check(false, `${repo.name}: failed to read status`) && allOk
      }
    }

    console.log(allOk ? pc.green('\nAll checks passed') : pc.red('\nSome checks failed'))
    process.exit(allOk ? 0 : 1)
  })
