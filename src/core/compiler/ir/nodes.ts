import type {IrVisitor} from "./visitor.ts";
import type {OrParameter, TopLevelNode, VariableCompareOpType, VariableOpType} from "./types.ts";
import type {
  ProcedureParameterRegistryEntry,
  ProcedureRegistryEntry,
  VariableRegistryEntry
} from "../../blockly/registry";
import type {ItemStackEditorResult} from '../../editor'

/**
 * An IR node specifies the semantic structure of the user's code while keeping a reference to its source whenever possible.
 * It allows visiting via an IR visitor interface using the `accept<T>` method.
 */
export abstract class IrNode {
  sourceBlockId: string | null

  constructor(sourceBlockId?: string | null) {
    this.sourceBlockId = sourceBlockId ?? null
  }

  abstract accept<T>(visitor: IrVisitor<T>): T
}

export class DatapackNode extends IrNode {
  readonly topLevelNodes: TopLevelNode[]

  constructor(topLevelNodes: TopLevelNode[]) {
    super()
    this.topLevelNodes = topLevelNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitDatapack(this)
  }
}

export class SegmentNode extends IrNode {
  readonly parts: (IrNode | string)[]

  constructor(parts: (IrNode | string)[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.parts = parts
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitSegment(this)
  }
}

export class OnLoadNode extends IrNode {
  readonly bodyNodes: IrNode[]

  constructor(bodyNodes: IrNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitOnLoad(this)
  }
}

export class OnTickNode extends IrNode {
  readonly bodyNodes: IrNode[]

  constructor(bodyNodes: IrNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitOnTick(this)
  }
}

export class LiteralIntNode extends IrNode {
  readonly value: number

  constructor(value: number, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.value = value
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralInt(this)
  }
}

export class LiteralStringNode extends IrNode {
  readonly value: string

  constructor(value: string, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.value = value
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralString(this)
  }
}

export class LiteralPositionNode extends IrNode {
  readonly x: string // TODO placeholder; should be tilde-and-caret node
  readonly y: string
  readonly z: string

  constructor(x: string, y: string, z: string, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.x = x
    this.y = y
    this.z = z
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralPosition(this)
  }
}

export class LiteralRangeNode extends IrNode {
  readonly minNode: OrParameter<LiteralIntNode> // TODO add number type (not just int)
  readonly maxNode: OrParameter<LiteralIntNode>

  constructor(minNode: OrParameter<LiteralIntNode>, maxNode: OrParameter<LiteralIntNode>, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.minNode = minNode
    this.maxNode = maxNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralRange(this)
  }
}

export class LiteralAngleNode extends IrNode {
  readonly yaw: string // TODO placeholder
  readonly pitch: string

  constructor(yaw: string, pitch: string, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.yaw = yaw
    this.pitch = pitch
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralAngle(this)
  }
}

export abstract class BooleanNode extends IrNode {}

export class VariableMatchesNode extends BooleanNode {
  readonly variableNode: VariableNode
  readonly rangeNode: LiteralRangeNode

  constructor(variableNode: VariableNode, rangeNode: LiteralRangeNode, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.variableNode = variableNode
    this.rangeNode = rangeNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitVariableMatches(this)
  }
}

export class VariableCompareNode extends BooleanNode {
  readonly variableNode: VariableNode
  readonly op: VariableCompareOpType
  readonly rightNode: OrParameter<VariableNode | LiteralIntNode>

  constructor(variableNode: VariableNode, op: VariableCompareOpType, rightNode: OrParameter<VariableNode | LiteralIntNode>, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.variableNode = variableNode
    this.op = op
    this.rightNode = rightNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitVariableCompare(this)
  }
}

export class IfNode extends IrNode {
  readonly conditionNode: BooleanNode
  readonly trueBodyNodes: IrNode[]
  readonly falseBodyNodes: IrNode[]

  constructor(conditionNode: BooleanNode, trueBodyNodes: IrNode[], falseBodyNodes: IrNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.conditionNode = conditionNode
    this.trueBodyNodes = trueBodyNodes
    this.falseBodyNodes = falseBodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitIf(this)
  }
}

export class WhileNode extends IrNode {
  readonly conditionNode: BooleanNode
  readonly bodyNodes: IrNode[]

  constructor(conditionNode: BooleanNode, bodyNodes: IrNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.conditionNode = conditionNode
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitWhile(this)
  }
}

export class VariableNode extends IrNode {
  readonly variableEntry: VariableRegistryEntry

  constructor(variableEntry: VariableRegistryEntry, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.variableEntry = variableEntry
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitVariable(this)
  }
}

export class VariableOperationNode extends IrNode {
  readonly variableNode: VariableNode
  readonly opType: VariableOpType
  readonly rightNode: IrNode

  constructor(variableNode: VariableNode, opType: VariableOpType, rightNode: IrNode, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.variableNode = variableNode
    this.opType = opType
    this.rightNode = rightNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitVariableOperation(this)
  }
}

export class ProcedureDefinitionNode extends IrNode {
  readonly procedureEntry: ProcedureRegistryEntry
  readonly bodyNodes: IrNode[]

  constructor(procedureEntry: ProcedureRegistryEntry, bodyNodes: IrNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.procedureEntry = procedureEntry
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitProcedureDefinition(this)
  }
}

export class ProcedureParameterNode extends IrNode {
  readonly parameterEntry: ProcedureParameterRegistryEntry

  constructor(parameterEntry: ProcedureParameterRegistryEntry, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.parameterEntry = parameterEntry
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitProcedureParameter(this)
  }
}

export class ProcedureCallArgumentNode extends IrNode {
  readonly parameterEntry: ProcedureParameterRegistryEntry
  readonly valueNode: IrNode

  constructor(parameterEntry: ProcedureParameterRegistryEntry, valueNode: IrNode, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.parameterEntry = parameterEntry
    this.valueNode = valueNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitProcedureCallArgument(this)
  }
}

export class ProcedureCallNode extends IrNode {
  readonly procedureEntry: ProcedureRegistryEntry
  readonly argumentNodes: ProcedureCallArgumentNode[]

  constructor(procedureEntry: ProcedureRegistryEntry, argumentNodes: ProcedureCallArgumentNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.procedureEntry = procedureEntry
    this.argumentNodes = argumentNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitProcedureCall(this)
  }
}

export class ItemStackNode extends IrNode {
  readonly itemStackData: ItemStackEditorResult

  constructor(itemStackData: ItemStackEditorResult, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.itemStackData = itemStackData
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitItemStack(this)
  }
}

export class TargetSelectorNode extends IrNode {
  readonly targetCategory: string
  readonly clauseNodes: SegmentNode[]

  constructor(targetCategory: string, clauseNodes: SegmentNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.targetCategory = targetCategory
    this.clauseNodes = clauseNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitTargetSelector(this)
  }
}

export class ExecuteNode extends IrNode {
  readonly clauseNodes: SegmentNode[]
  readonly bodyNodes: IrNode[]

  constructor(clauseNodes: SegmentNode[], bodyNodes: IrNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.clauseNodes = clauseNodes
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitExecute(this)
  }
}
