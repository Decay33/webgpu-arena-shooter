function isEnabledFlag(value: string | undefined) {
  if (!value) {
    return false
  }

  const normalizedValue = value.trim().toLowerCase()
  return (
    normalizedValue === '1' ||
    normalizedValue === 'true' ||
    normalizedValue === 'yes' ||
    normalizedValue === 'on'
  )
}

export const DEBUG_FLAGS = {
  gameLogs: isEnabledFlag(import.meta.env.VITE_DEBUG_GAME_LOGS),
} as const

export function debugGameLog(...args: unknown[]) {
  if (!DEBUG_FLAGS.gameLogs) {
    return
  }

  console.log(...args)
}
