import {IrNode} from './ir'

export class Segment {
  readonly content: string
  readonly sourceBlockId?: string
  readonly filePath?: string

  constructor(content: string, node?: IrNode, filePath?: string) {
    this.content = content
    this.sourceBlockId = node?.sourceBlockId ?? undefined
    this.filePath = filePath
  }
}
