import {
  type DatapackNode, ItemStackNode, LiteralIntNode, LiteralStringNode,
  OnLoadNode,
  OnTickNode, ProcedureCallArgumentNode, ProcedureCallNode,
  ProcedureDefinitionNode, ProcedureParameterNode,
  VariableNode,
  VariableOperationNode, ExecuteNode, LiteralPositionNode, LiteralRangeNode, LiteralRotationNode, TargetSelectorNode,
  VariableMatchesNode, VariableCompareNode, IfNode, WhileNode, CommandCompositeNode, FragmentCompositeNode,
  TempVariableNode, VariableSetNode, FunctionDefinitionNode, FunctionCallNode, IrNode, OnPlayerMinesBlockNode,
  FunctionTagNode, RaycastEntityNode
} from "./nodes.ts";

export interface IrVisitor<T> {
  visitCommandComposite(node: CommandCompositeNode): T
  visitFragmentComposite(node: FragmentCompositeNode): T
  visitFunctionDefinition(node: FunctionDefinitionNode): T
  visitFunctionCall(node: FunctionCallNode): T

  visitDatapack(node: DatapackNode): T
  visitFunctionTag(node: FunctionTagNode): T

  visitOnLoad(node: OnLoadNode): T
  visitOnTick(node: OnTickNode): T
  visitOnPlayerMinesBlock(node: OnPlayerMinesBlockNode): T

  visitLiteralInt(node: LiteralIntNode): T
  visitLiteralString(node: LiteralStringNode): T
  visitLiteralPosition(node: LiteralPositionNode): T
  visitLiteralRange(node: LiteralRangeNode): T
  visitLiteralRotation(node: LiteralRotationNode): T

  visitVariableMatches(node: VariableMatchesNode): T
  visitVariableCompare(node: VariableCompareNode): T
  visitIf(node: IfNode): T
  visitWhile(node: WhileNode): T

  visitTempVariable(node: TempVariableNode): T
  visitVariable(node: VariableNode): T
  visitVariableSet(node: VariableSetNode): T
  visitVariableOperation(node: VariableOperationNode): T

  visitProcedureDefinition(node: ProcedureDefinitionNode): T
  visitProcedureParameter(node: ProcedureParameterNode): T
  visitProcedureCall(node: ProcedureCallNode): T
  visitProcedureCallArgument(node: ProcedureCallArgumentNode): T

  visitItemStack(node: ItemStackNode): T
  visitTargetSelector(node: TargetSelectorNode): T

  visitExecute(node: ExecuteNode): T

  visitRaycastEntity(node: RaycastEntityNode): T
}

export abstract class SelectiveIrVisitor<T> implements IrVisitor<T> {
  private disallow(node: IrNode): never {
    throw new Error(`${this.constructor.name} does not expect ${node.constructor.name}.`)
  }

  visitCommandComposite(node: CommandCompositeNode): T {
    this.disallow(node)
  }

  visitDatapack(node: DatapackNode): T {
    this.disallow(node)
  }

  visitExecute(node: ExecuteNode): T {
    this.disallow(node)
  }

  visitFragmentComposite(node: FragmentCompositeNode): T {
    this.disallow(node)
  }

  visitFunctionCall(node: FunctionCallNode): T {
    this.disallow(node)
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): T {
    this.disallow(node)
  }

  visitIf(node: IfNode): T {
    this.disallow(node)
  }

  visitItemStack(node: ItemStackNode): T {
    this.disallow(node)
  }

  visitLiteralInt(node: LiteralIntNode): T {
    this.disallow(node)
  }

  visitLiteralPosition(node: LiteralPositionNode): T {
    this.disallow(node)
  }

  visitLiteralRange(node: LiteralRangeNode): T {
    this.disallow(node)
  }

  visitLiteralRotation(node: LiteralRotationNode): T {
    this.disallow(node)
  }

  visitLiteralString(node: LiteralStringNode): T {
    this.disallow(node)
  }

  visitOnLoad(node: OnLoadNode): T {
    this.disallow(node)
  }

  visitOnTick(node: OnTickNode): T {
    this.disallow(node)
  }

  visitProcedureCall(node: ProcedureCallNode): T {
    this.disallow(node)
  }

  visitProcedureCallArgument(node: ProcedureCallArgumentNode): T {
    this.disallow(node)
  }

  visitProcedureDefinition(node: ProcedureDefinitionNode): T {
    this.disallow(node)
  }

  visitProcedureParameter(node: ProcedureParameterNode): T {
    this.disallow(node)
  }

  visitTargetSelector(node: TargetSelectorNode): T {
    this.disallow(node)
  }

  visitTempVariable(node: TempVariableNode): T {
    this.disallow(node)
  }

  visitVariable(node: VariableNode): T {
    this.disallow(node)
  }

  visitVariableCompare(node: VariableCompareNode): T {
    this.disallow(node)
  }

  visitVariableMatches(node: VariableMatchesNode): T {
    this.disallow(node)
  }

  visitVariableOperation(node: VariableOperationNode): T {
    this.disallow(node)
  }

  visitVariableSet(node: VariableSetNode): T {
    this.disallow(node)
  }

  visitWhile(node: WhileNode): T {
    this.disallow(node)
  }

  visitOnPlayerMinesBlock(node: OnPlayerMinesBlockNode): T {
    this.disallow(node)
  }

  visitFunctionTag(node: FunctionTagNode): T {
    this.disallow(node)
  }

  visitRaycastEntity(node: RaycastEntityNode): T {
    this.disallow(node)
  }
}