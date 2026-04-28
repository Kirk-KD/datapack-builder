import type {OutputFile, OutputFolder, OutputItem, OutputZip, Path} from './types'

function makeFolder(path: Path): OutputFolder {
  return {
    type: 'folder',
    path: path,
    content: []
  }
}

function normalizeKey(key: string): string {
  return key.replace(/^\/+|\/+$/g, '')
}

function ensureFolderPath(root: OutputFolder, pathArr: string[]): OutputFolder {
  let current: OutputFolder = root
  const seen: string[] = []

  for (const segment of pathArr) {
    seen.push(segment)
    const next = current.content.find(
      (c): c is OutputFolder => c.type === 'folder' && Array.isArray(c.path) && c.path[c.path.length - 1] === segment
    )

    if (next) {
      current = next
      continue
    }

    const newFolder = makeFolder([...seen])
    current.content.push(newFolder)
    current = newFolder
  }

  return current
}

function insertFile(root: OutputFolder, key: string, content: string): void {
  const normalized = normalizeKey(key)
  if (normalized === '') return

  const parts = normalized.split('/')
  if (parts.length === 0) return

  if (parts.length === 1) {
    const file: OutputFile = { type: 'file', path: [parts[0]], content }
    root.content.push(file)
    return
  }

  const fileName = parts[parts.length - 1]
  const folderPath = parts.slice(0, -1)
  const folder = ensureFolderPath(root, folderPath)
  const file: OutputFile = { type: 'file', path: [...folderPath, fileName], content }
  folder.content.push(file)
}

function sortContents(items: OutputItem[]): void {
  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    const aName = (a.path && a.path[a.path.length - 1]) || ''
    const bName = (b.path && b.path[b.path.length - 1]) || ''
    return aName.localeCompare(bName)
  })

  for (const it of items) if (it.type === 'folder') sortContents((it as OutputFolder).content)
}

export function mapToOutputZip(map: Map<string, string>, timestamp: Date): OutputZip {
  const root = makeFolder(null)

  map.forEach((content, key) => {
    insertFile(root, key, content)
  })

  sortContents(root.content)

  return {
    timestamp,
    root,
    getItem(this: OutputZip, path, isFile) {
      if (!path) return this.root

      let current: OutputFolder | undefined = this.root

      for (let i = 0; i < path.length; i++) {
        const segment = path[i]

        if (!current) return undefined

        const found = current.content.find(item => (item.path && item.path[item.path.length - 1]) === segment)

        if (!found) return undefined

        if (i === path.length - 1) {
          if (isFile === true && found.type !== 'file') return undefined
          if (isFile === false && found.type !== 'folder') return undefined
          return found
        }

        if (found.type !== 'folder') return undefined
        current = found as OutputFolder
      }

      return undefined
    }
  }
}