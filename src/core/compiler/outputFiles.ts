import JSZip from 'jszip'
import type {Segment} from './mapping.ts'

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
    this.content.concat(content)
    return this
  }

  getStringContent(): string {
    return this.content.map(segment => segment.content).join('')
  }
}
