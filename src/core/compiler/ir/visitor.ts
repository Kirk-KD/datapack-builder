import {
  type DatapackNode, ItemStackNode, LiteralIntNode, LiteralStringNode,
  OnLoadNode,
  OnTickNode, ProcedureCallArgumentNode, ProcedureCallNode,
  ProcedureDefinitionNode, ProcedureParameterNode,
  VariableNode,
  VariableOperationNode, ExecuteNode, LiteralPositionNode, LiteralRangeNode, LiteralRotationNode, TargetSelectorNode,
  VariableMatchesNode, VariableCompareNode, IfNode, WhileNode, CommandCompositeNode, FragmentCompositeNode,
  TempVariableNode, VariableSetNode
} from "./nodes.ts";

export interface IrVisitor<T> {
  visitCommandComposite(node: CommandCompositeNode): T
  visitFragmentComposite(node: FragmentCompositeNode): T

  visitDatapack(node: DatapackNode): T

  visitOnLoad(node: OnLoadNode): T
  visitOnTick(node: OnTickNode): T

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
}