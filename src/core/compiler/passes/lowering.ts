import {
  CommandCompositeNode, CommandNode,
  DatapackNode,
  ExecuteNode,
  FragmentCompositeNode,
  IfNode,
  IrNode,
  type IrVisitor, ItemStackNode, LiteralIntNode, LiteralPositionNode, LiteralRangeNode, LiteralRotationNode,
  LiteralStringNode, OnLoadNode, OnTickNode, ProcedureCallArgumentNode, ProcedureCallNode, ProcedureDefinitionNode,
  ProcedureParameterNode, TargetSelectorNode, VariableCompareNode, VariableMatchesNode, VariableNode,
  VariableOperationNode, WhileNode
} from '../ir'

interface LoweredResult {
  pre: CommandNode[]
  node: IrNode
}

export class LoweringPass implements IrVisitor<LoweredResult> {
  run(node: DatapackNode): DatapackNode {
    return this.visitDatapack(node).node as DatapackNode
  }

  visitCommandComposite(node: CommandCompositeNode): LoweredResult {
    return { pre: [], node }
  }

  visitDatapack(node: DatapackNode): LoweredResult {
    return { pre: [], node }
  }

  visitExecute(node: ExecuteNode): LoweredResult {
    return { pre: [], node }
  }

  visitFragmentComposite(node: FragmentCompositeNode): LoweredResult {
    return { pre: [], node }
  }

  visitIf(node: IfNode): LoweredResult {
    return { pre: [], node }
  }

  visitItemStack(node: ItemStackNode): LoweredResult {
    return { pre: [], node }
  }

  visitLiteralInt(node: LiteralIntNode): LoweredResult {
    return { pre: [], node }
  }

  visitLiteralPosition(node: LiteralPositionNode): LoweredResult {
    return { pre: [], node }
  }

  visitLiteralRange(node: LiteralRangeNode): LoweredResult {
    return { pre: [], node }
  }

  visitLiteralRotation(node: LiteralRotationNode): LoweredResult {
    return { pre: [], node }
  }

  visitLiteralString(node: LiteralStringNode): LoweredResult {
    return { pre: [], node }
  }

  visitOnLoad(node: OnLoadNode): LoweredResult {
    return { pre: [], node }
  }

  visitOnTick(node: OnTickNode): LoweredResult {
    return { pre: [], node }
  }

  visitProcedureCall(node: ProcedureCallNode): LoweredResult {
    return { pre: [], node }
  }

  visitProcedureCallArgument(node: ProcedureCallArgumentNode): LoweredResult {
    return { pre: [], node }
  }

  visitProcedureDefinition(node: ProcedureDefinitionNode): LoweredResult {
    return { pre: [], node }
  }

  visitProcedureParameter(node: ProcedureParameterNode): LoweredResult {
    return { pre: [], node }
  }

  visitTargetSelector(node: TargetSelectorNode): LoweredResult {
    return { pre: [], node }
  }

  visitVariable(node: VariableNode): LoweredResult {
    return { pre: [], node }
  }

  visitVariableCompare(node: VariableCompareNode): LoweredResult {
    return { pre: [], node }
  }

  visitVariableMatches(node: VariableMatchesNode): LoweredResult {
    return { pre: [], node }
  }

  visitVariableOperation(node: VariableOperationNode): LoweredResult {
    return { pre: [], node }
  }

  visitWhile(node: WhileNode): LoweredResult {
    return { pre: [], node }
  }
}