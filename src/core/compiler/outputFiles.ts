export class OutputFiles {
  readonly files: Map<string, OutputFile> = new Map<string, OutputFile>()

  with(path: string) {
    const file = this.files.get(path) ?? new OutputFile()
    this.files.set(path, file)
    return file
  }

  toStringMap(): Map<string, string> {
    return new Map(
      Array.from(this.files.entries()).map(([path, file]) => [path, file.content])
    )
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