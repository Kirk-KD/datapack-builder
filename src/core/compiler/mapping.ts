import {FunctionCallNode, IrNode} from './ir'

export class Segment {
  readonly content: string
  readonly node?: IrNode

  constructor(content: string, node?: IrNode) {
    this.content = content
    this.node = node
  }

  getFunctionId(): string | null {
    return this.node instanceof FunctionCallNode ? this.node.name : null
  }

  getSourceBlockId(): string | null {
    return this.node?.sourceBlockId ?? null
  }
}
