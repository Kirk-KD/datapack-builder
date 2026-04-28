export type OutputZip = {
  timestamp: Date
  root: OutputFolder

  getItem: (this: OutputZip, path: Path, isFile?: boolean) => (OutputItem | undefined)
}

export type Path = string[] | null

export interface OutputItem {
  type: 'file' | 'folder'
  path: Path
  content: unknown
}

export interface OutputFolder extends OutputItem {
  type: 'folder'
  content: OutputItem[]
}

export interface OutputFile extends OutputItem {
  type: 'file'
  content: string
  path: string[]
}