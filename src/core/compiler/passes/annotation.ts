import {
  SelectiveIrVisitor,
  CommandCompositeNode,
  DatapackNode,
  FunctionDefinitionNode,
  ProcedureParameterNode,
  FragmentCompositeNode,
  TargetSelectorNode,
  LiteralPositionNode,
  LiteralRangeNode,
  LiteralRotationNode,
  LiteralIntNode,
  LiteralStringNode,
  VariableNode,
  FunctionCallNode,
  TempVariableNode,
  ItemStackNode,
  FunctionTagNode,
  NumberNode,
} from '../ir'

/**
 * The `AnnotationPass` traverses the IR deeply. If any descendant of a
 * `CommandCompositeNode` contains a `ProcedureParameterNode`, that `CommandCompositeNode`
 * must be marked as a macro (`isMacro = true`). We track the current enclosing
 * `CommandCompositeNode` with a stack while traversing nested fragments.
 */
export class AnnotationPass extends SelectiveIrVisitor<void> {
  private commandStack: CommandCompositeNode[] = []

  private pushCommand(node: CommandCompositeNode) {
    this.commandStack.push(node)
  }

  private popCommand(): void {
    this.commandStack.pop()
  }

  private markCurrentAsMacro(): void {
    const current = this.commandStack[this.commandStack.length - 1]
    if (current) current.isMacro = true
  }

  visitDatapack(node: DatapackNode): void {
    node.topLevelNodes.forEach(n => n.accept(this))
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): void {
    node.bodyNodes.forEach(n => n.accept(this))
  }

  visitCommandComposite(node: CommandCompositeNode): void {
    this.pushCommand(node)
    // parts can be FragmentNode or string
    node.parts.forEach(part => {
      if (typeof part !== 'string') part.accept(this)
    })
    this.popCommand()
  }

  visitFragmentComposite(node: FragmentCompositeNode): void {
    node.parts.forEach(part => {
      if (typeof part !== 'string') part.accept(this)
    })
  }
  visitTargetSelector(node: TargetSelectorNode): void {
    node.clauseNodes.forEach(c => c.accept(this))
  }

  visitLiteralPosition(node: LiteralPositionNode): void {
    node.xNode.accept(this)
    node.yNode.accept(this)
    node.zNode.accept(this)
  }

  visitLiteralRange(node: LiteralRangeNode): void {
    node.minNode.accept(this)
    node.maxNode.accept(this)
  }

  visitLiteralRotation(node: LiteralRotationNode): void {
    node.yawNode.accept(this)
    node.pitchNode.accept(this)
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */

  visitNumber(_node: NumberNode): void {}

  visitLiteralInt(_node: LiteralIntNode): void {}

  visitLiteralString(_node: LiteralStringNode): void {}

  visitVariable(_node: VariableNode): void {}

  visitFunctionCall(_node: FunctionCallNode): void {}

  visitFunctionTag(_node: FunctionTagNode): void {}

  visitTempVariable(_node: TempVariableNode): void {}

  visitItemStack(_node: ItemStackNode): void {}

  visitProcedureParameter(_node: ProcedureParameterNode): void {
    // When a procedure parameter is encountered anywhere under a CommandNode,
    // mark the nearest enclosing CommandNode as a macro.
    this.markCurrentAsMacro()
  }

  /* eslint-enable @typescript-eslint/no-unused-vars */
}