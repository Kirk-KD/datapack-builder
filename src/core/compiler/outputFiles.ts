import JSZip from 'jszip'
import {Segment} from './mapping.ts'

export class OutputFiles {
  readonly files: Map<string, OutputFile> = new Map<string, OutputFile>()
  readonly timestamp: Date = new Date()

  with(path: string) {
    const file = this.files.get(path) ?? new OutputFile()
    this.files.set(path, file)
    return file
  }

  exists(path: string) {
    return this.files.has(path)
  }

  get(path: string) {
    return this.files.get(path)
  }

  /**
   * Cleans up the output files by merging all adjacent fragments.
   */
  clean() {
    for (const file of this.files.values()) file.mergeSegments()
  }

  toStringMap(): Map<string, string> {
    return new Map(
      Array.from(this.files.entries())
        .map(([path, file]) => [path, file.getStringContent()])
    )
  }

  download(fileName: string) {
    const zip = new JSZip()

    for (const [path, content] of this.toStringMap().entries())
      zip.file(path, content)

    zip.generateAsync({ type: 'blob' }).then(blob => {
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = `${fileName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }
}

class OutputFile {
  content: Segment[] = []

  write(content: Segment[]): OutputFile {
    this.content = content
    return this
  }

  prepend(content: Segment[]): OutputFile {
    this.content = content.concat(this.content)
    return this
  }

  append(content: Segment[]): OutputFile {
    this.content = this.content.concat(content)
    return this
  }

  getStringContent(): string {
    return this.content.map(segment => segment.content).join('')
  }

  /**
   * Merge adjacent fragments of the same source (same file path and same source block id).
   * This operation is in-place.
   */
  mergeSegments() {
    let i = 0
    while (i < this.content.length - 1) {
      const current = this.content[i]
      const next = this.content[i + 1]

      // Check if adjacent segments have the same source
      if (current.sourceBlockId === next.sourceBlockId && current.filePath === next.filePath) {
        // Create merged segment with combined content
        const merged = new Segment(current.content + next.content)
        Object.assign(merged, {
          sourceBlockId: current.sourceBlockId,
          filePath: current.filePath
        })

        // Replace current with merged and remove next
        this.content[i] = merged
        this.content.splice(i + 1, 1)
        // Don't increment i, check the merged segment against the next one
      } else {
        i++
      }
    }
  }
}
