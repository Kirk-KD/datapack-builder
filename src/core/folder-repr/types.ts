export type FilePathArray = string[] | null
export type OutputItem = OutputFileItem | OutputFolderItem

export interface OutputFileItem {
  type: 'file'
  path: string[]
  name: string
}

export interface OutputFolderItem {
  type: 'folder'
  path: FilePathArray
  name: string
}
