export class ConfigNotFoundError extends Error {
  override readonly name = 'ConfigNotFoundError'
  constructor(cwd: string) {
    super(`Could not find repoflow.config.ts starting from: ${cwd}\nRun: repoflow init`)
  }
}

export class ConfigValidationError extends Error {
  override readonly name = 'ConfigValidationError'
  constructor(message: string) {
    super(message)
  }
}

export class MissingEnvVarError extends Error {
  override readonly name = 'MissingEnvVarError'
  constructor(readonly varName: string) {
    super(`Missing required environment variable: ${varName}`)
  }
}
