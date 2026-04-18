import { MissingEnvVarError } from './errors.js'
import type { ResolvedConfig } from './types.js'

const ENV_PATTERN = /\$\{([^}]+)\}/g

function interpolate(value: string): string {
  return value.replace(ENV_PATTERN, (_, varName: string) => {
    const resolved = process.env[varName]
    if (resolved === undefined) throw new MissingEnvVarError(varName)
    return resolved
  })
}

export function resolveEnvVars(config: ResolvedConfig): ResolvedConfig {
  if (!config.notify.slack) return config
  return {
    ...config,
    notify: {
      slack: {
        channelId: interpolate(config.notify.slack.channelId),
        botToken: interpolate(config.notify.slack.botToken),
      },
    },
  }
}
