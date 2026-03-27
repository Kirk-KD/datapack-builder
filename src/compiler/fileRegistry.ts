import { stripMarkers } from './executeContext'

const files: Map<string, string> = new Map()

export function addFile(path: string, content: string): void {
  files.set(path, stripMarkers(content))
}

export function prependToFile(path: string, line: string): void {
  const existing = files.get(path) ?? ''
  files.set(path, stripMarkers(line + existing))
}

export function appendToFile(path: string, line: string): void {
  const existing = files.get(path) ?? ''
  files.set(path, stripMarkers(existing + line))
}

export function getFiles(): Map<string, string> {
  return files
}

export function resetFiles(): void {
  files.clear()
}