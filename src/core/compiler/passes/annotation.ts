import {SelectiveIrVisitor} from '../ir'
import {CommandCompositeNode, DatapackNode, FunctionDefinitionNode, OnLoadNode, OnTickNode, ProcedureParameterNode} from '../ir'

export class AnnotationPass extends SelectiveIrVisitor<void> {
  visitDatapack(node: DatapackNode): void {
    node.topLevelNodes.forEach(n => n.accept(this))
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): void {
    node.bodyNodes.forEach(n => n.accept(this))
  }

  visitOnLoad(node: OnLoadNode): void {
    node.bodyNodes.forEach(n => n.accept(this))
  }

  visitOnTick(node: OnTickNode): void {
    node.bodyNodes.forEach(n => n.accept(this))
  }

  visitCommandComposite(node: CommandCompositeNode): void {
    const hasProcedureParameter = node.parts.some(part => part instanceof ProcedureParameterNode)
    if (hasProcedureParameter) {
      node.isMacro = true
    }
  }
}