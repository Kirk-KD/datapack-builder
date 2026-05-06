export class Segment {
  readonly content: string
  readonly source?: Source

  constructor(content: string, source?: Source) {
    this.content = content
    this.source = source
  }
}

export interface Source {
  readonly blockId?: string
  readonly functionId?: string
}
