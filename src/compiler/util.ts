export type SNBT = {
  [key: string]: SNBT
} | SNBT[] | string | number | boolean | null

function escapeSnbtString(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
}

function formatPrimitive(value: Exclude<SNBT, Record<string, SNBT> | SNBT[]>) {
  if (typeof value === 'string') {
    return `"${escapeSnbtString(value)}"`
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (value === null) {
    return 'null'
  }

  return String(value)
}

function formatSnbtKey(key: string) {
  return `"${escapeSnbtString(key)}"`
}

function isSnbtObject(value: SNBT): value is Record<string, SNBT> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function snbtToString(
  snbt: SNBT,
  config?: {
    shallow?: boolean
  }
): string {
  if (config?.shallow) {
    if (typeof snbt !== 'object' || snbt === null || Array.isArray(snbt)) {
      return String(snbt)
    }

    const entries = Object.entries(snbt).map(([key, value]) => `${formatSnbtKey(key)}:"${value}"`)
    return `{${entries.join(',')}}`
  }

  if (typeof snbt !== 'object' || snbt === null) {
    return formatPrimitive(snbt)
  }

  if (Array.isArray(snbt)) {
    return `[${snbt.map((entry) => snbtToString(entry, config)).join(',')}]`
  }

  if (!isSnbtObject(snbt)) {
    return formatPrimitive(snbt)
  }

  const entries = Object.entries(snbt)
    .map(([key, value]) => `${formatSnbtKey(key)}:${snbtToString(value, config)}`)
  return `{${entries.join(',')}}`
}
