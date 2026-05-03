import JSZip from 'jszip'

export class OutputFiles {
  readonly files: Map<string, OutputFile> = new Map<string, OutputFile>()

  with(path: string) {
    const file = this.files.get(path) ?? new OutputFile()
    this.files.set(path, file)
    return file
  }

  exists(path: string) {
    return this.files.has(path)
  }

  toStringMap(): Map<string, string> {
    return new Map(
      Array.from(this.files.entries())
        .map(([path, file]) => [path, file.content])
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
  content: string = ''

  write(content: string): OutputFile {
    this.content = content
    return this
  }

  prepend(content: string): OutputFile {
    this.content = content + this.content
    return this
  }

  append(content: string): OutputFile {
    this.content += content
    return this
  }
}