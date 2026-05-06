import type {FilePathArray, OutputItem} from './types'
import type {OutputFiles} from '../compiler/outputFiles'

/**
 * Get the contents of a folder at the given path.
 * Returns an array of files and folders directly under the path.
 */
export function getFolderContents(outputFiles: OutputFiles, folderPath: FilePathArray): OutputItem[] {
  const folderPathStr = folderPath ? folderPath.join('/') : ''
  const items = new Map<string, OutputItem>()

  for (const [filePath] of outputFiles.files) {
    const parts = filePath.split('/')

    // Determine the depth we're looking for
    const targetDepth = folderPath ? folderPath.length : 0

    // Check if this file is under our folder
    if (folderPath && !filePath.startsWith(folderPathStr + '/')) continue

    // At root level
    if (!folderPath) {
      if (parts.length === 1) {
        // Root-level file
        items.set(filePath, {
          type: 'file',
          path: parts,
          name: filePath
        })
      } else if (parts.length > 1) {
        // Root-level folder container
        const topLevelName = parts[0]
        if (!items.has(topLevelName)) {
          items.set(topLevelName, {
            type: 'folder',
            path: [topLevelName],
            name: topLevelName
          })
        }
      }
      continue
    }

    // For nested paths, check if item is direct child
    if (folderPath) {
      if (parts.length === targetDepth + 1) {
        // Direct file child
        const name = parts[targetDepth]
        items.set(name, {
          type: 'file',
          path: parts,
          name
        })
      } else if (parts.length > targetDepth + 1) {
        // Folder (intermediate path)
        const folderName = parts[targetDepth]
        if (!items.has(folderName)) {
          items.set(folderName, {
            type: 'folder',
            path: parts.slice(0, targetDepth + 1),
            name: folderName
          })
        }
      }
    }
  }

  return Array.from(items.values()).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Determine if a path refers to a file or folder.
 */
export function getItemType(outputFiles: OutputFiles, pathArr: FilePathArray): 'file' | 'folder' | undefined {
  if (!pathArr) return 'folder' // root is always a folder

  const pathStr = pathArr.join('/')
  if (outputFiles.files.has(pathStr)) return 'file'

  // Check if it's a folder (has files under it)
  const prefix = pathStr + '/'
  for (const filePath of outputFiles.files.keys()) {
    if (filePath.startsWith(prefix)) return 'folder'
  }

  return undefined
}
