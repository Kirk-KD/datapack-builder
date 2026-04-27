const files: Map<string, string> = new Map()

export function addFile(path: string, content: string): void {
  files.set(path, content)
}

export function prependToFile(path: string, line: string): void {
  const existing = files.get(path) ?? ''
  files.set(path, line + existing)
}

export function appendToFile(path: string, line: string): void {
  const existing = files.get(path) ?? ''
  files.set(path, existing + line)
}

export function getFiles(): Map<string, string> {
  return new Map(files)
}

export function resetFiles(): void {
  files.clear()
}