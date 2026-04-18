import {
  ConfigNotFoundError,
  ConfigValidationError,
  MissingEnvVarError,
} from '@axelmth/repoflow-core'
import pc from 'picocolors'

export function handleError(e: unknown): never {
  if (e instanceof ConfigNotFoundError) {
    console.error(pc.red('✗ Config not found'))
    console.error(pc.dim('  → Run: repoflow init'))
    process.exit(1)
  }

  if (e instanceof ConfigValidationError) {
    console.error(pc.red('✗ Invalid config'))
    console.error(e.message)
    process.exit(1)
  }

  if (e instanceof MissingEnvVarError) {
    console.error(pc.red(`✗ Missing environment variable: ${e.varName}`))
    console.error(pc.dim(`  → Set ${e.varName} in your environment`))
    process.exit(1)
  }

  console.error(pc.red('✗ Unexpected error'))
  if (e instanceof Error) {
    console.error(e.message)
    if (e.stack) console.error(pc.dim(e.stack))
  } else {
    console.error(String(e))
  }
  process.exit(3)
}
