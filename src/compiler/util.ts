export function snbtToString(snbt: Record<string, string>): string {
  const entries = Object.entries(snbt).map(([key, value]) => `${key}:"${value}"`)
  return `{${entries.join(',')}}`
}
