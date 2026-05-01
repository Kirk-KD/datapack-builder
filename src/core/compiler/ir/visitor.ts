import {
  SegmentNode,
  type DatapackNode, ItemStackNode, LiteralIntNode, LiteralStringNode,
  OnLoadNode,
  OnTickNode, ProcedureCallArgumentNode, ProcedureCallNode,
  ProcedureDefinitionNode, ProcedureParameterNode,
  VariableNode,
  VariableOperationNode, ExecuteNode, LiteralPositionNode, LiteralRangeNode, LiteralAngleNode, TargetSelectorNode,
  VariableMatchesNode, VariableCompareNode, IfNode, WhileNode
} from "./nodes.ts";

export interface IrVisitor<T> {
  visitSegment(node: SegmentNode): T

  visitDatapack(node: DatapackNode): T

  visitOnLoad(node: OnLoadNode): T
  visitOnTick(node: OnTickNode): T

  visitLiteralInt(node: LiteralIntNode): T
  visitLiteralString(node: LiteralStringNode): T
  visitLiteralPosition(node: LiteralPositionNode): T
  visitLiteralRange(node: LiteralRangeNode): T
  visitLiteralAngle(node: LiteralAngleNode): T

  visitVariableMatches(node: VariableMatchesNode): T
  visitVariableCompare(node: VariableCompareNode): T
  visitIf(node: IfNode): T
  visitWhile(node: WhileNode): T

  visitVariable(node: VariableNode): T
  visitVariableOperation(node: VariableOperationNode): T

  visitProcedureDefinition(node: ProcedureDefinitionNode): T
  visitProcedureParameter(node: ProcedureParameterNode): T
  visitProcedureCall(node: ProcedureCallNode): T
  visitProcedureCallArgument(node: ProcedureCallArgumentNode): T

  visitItemStack(node: ItemStackNode): T
  visitTargetSelector(node: TargetSelectorNode): T

  visitExecute(node: ExecuteNode): T
}