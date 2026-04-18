import * as p from '@clack/prompts'
import { Command } from 'commander'
import { existsSync } from 'node:fs'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import pc from 'picocolors'

export const initCommand = new Command('init')
  .description('Scaffold a new repoflow.config.ts in the current directory')
  .action(async () => {
    const cwd = process.cwd()
    const configPath = join(cwd, 'repoflow.config.ts')

    p.intro(pc.bold('repoflow init'))

    if (existsSync(configPath)) {
      const overwrite = await p.confirm({
        message: 'repoflow.config.ts already exists. Overwrite?',
        initialValue: false,
      })
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Aborted.')
        process.exit(0)
      }
    }

    const name = await p.text({
      message: "What's the name of your meta-repo?",
      defaultValue: basename(cwd),
      placeholder: basename(cwd),
    })
    if (p.isCancel(name)) {
      p.cancel('Aborted.')
      process.exit(0)
    }

    const addRepos = await p.confirm({
      message: 'Do you want to add repos now?',
      initialValue: false,
    })
    if (p.isCancel(addRepos)) {
      p.cancel('Aborted.')
      process.exit(0)
    }

    const repos: Array<{ name: string; url: string }> = []

    if (addRepos) {
      let addMore = true
      while (addMore) {
        const repoName = await p.text({ message: 'Repo name?' })
        if (p.isCancel(repoName)) {
          p.cancel('Aborted.')
          process.exit(0)
        }

        const repoUrl = await p.text({ message: 'Repo git URL?' })
        if (p.isCancel(repoUrl)) {
          p.cancel('Aborted.')
          process.exit(0)
        }

        repos.push({ name: repoName, url: repoUrl })

        const another = await p.confirm({ message: 'Add another repo?', initialValue: false })
        if (p.isCancel(another)) {
          p.cancel('Aborted.')
          process.exit(0)
        }
        addMore = another
      }
    }

    const notifyChoice = await p.select({
      message: 'Notifications channel?',
      options: [
        { value: 'none', label: 'Nothing' },
        { value: 'slack', label: 'Slack' },
      ],
    })
    if (p.isCancel(notifyChoice)) {
      p.cancel('Aborted.')
      process.exit(0)
    }

    const reposStr =
      repos.length > 0
        ? repos.map((r) => `    { name: '${r.name}', url: '${r.url}' },`).join('\n')
        : `    // { name: 'my-repo', url: 'git@github.com:org/repo.git' },`

    const slackSection =
      notifyChoice === 'slack'
        ? `\n  notify: {\n    slack: {\n      channelId: '\${SLACK_RELEASES_CHANNEL_ID}',\n      botToken: '\${SLACK_BOT_TOKEN}',\n    },\n  },`
        : ''

    const configContent = [
      `import { defineConfig } from '@axelmth/repoflow-core'`,
      ``,
      `// ${name}`,
      `export default defineConfig({`,
      `  repos: [`,
      reposStr,
      `  ],`,
      `  appsDir: './apps',`,
      `  defaultBranch: 'main',${slackSection}`,
      `})`,
      ``,
    ].join('\n')

    await writeFile(configPath, configContent, 'utf8')

    const appsDir = join(cwd, 'apps')
    if (!existsSync(appsDir)) {
      await mkdir(appsDir, { recursive: true })
    }
    const gitkeepPath = join(appsDir, '.gitkeep')
    if (!existsSync(gitkeepPath)) {
      await writeFile(gitkeepPath, '', 'utf8')
    }

    const gitignorePath = join(cwd, '.gitignore')
    const gitignoreContent = existsSync(gitignorePath)
      ? await readFile(gitignorePath, 'utf8')
      : ''
    if (!gitignoreContent.includes('apps/*')) {
      await appendFile(gitignorePath, '\n# repoflow child repos\napps/*\n!apps/.gitkeep\n')
    }

    p.note(
      [
        `${pc.green('✓')} Created repoflow.config.ts`,
        `${pc.green('✓')} Created apps/.gitkeep`,
        existsSync(gitignorePath)
          ? `${pc.green('✓')} Updated .gitignore`
          : `${pc.green('✓')} Created .gitignore`,
      ].join('\n'),
      'Created',
    )
    p.outro(`Run ${pc.cyan('repoflow sync')} to clone your repos`)
  })
