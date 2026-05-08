import type {IrVisitor} from "./visitor.ts";
import type {OrParameter, TopLevelNode, VariableCompareOpType, VariableOpType} from "./types.ts";
import type {
  ProcedureParameterRegistryEntry,
  ProcedureRegistryEntry,
} from "../../blockly/registry";
import type {ItemStackEditorResult} from '../../editor'
import {Segment} from '../mapping.ts'

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

/**
 * Represents one line of command.
 */
export abstract class CommandNode extends IrNode {
  isMacro: boolean = false

  prefix(segments: Segment[]) {
    if (this.isMacro) return [new Segment('$')].concat(segments)
    return segments
  }
}

/**
 * Represents a fragment of a command, not a complete line.
 */
export abstract class FragmentNode extends IrNode {}

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

export class FunctionTagNode extends IrNode {
  readonly tag: 'load' | 'tick'
  readonly name: string

  constructor(tag: "load" | "tick", name: string, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.tag = tag
    this.name = name
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitFunctionTag(this)
  }
}

export class CommandCompositeNode extends CommandNode {
  readonly parts: (FragmentNode | string)[]
  readonly noSpace: boolean

  constructor(parts: (FragmentNode | string)[], sourceBlockId?: string | null, noSpace?: boolean) {
    super(sourceBlockId)
    this.parts = parts
    this.noSpace = noSpace ?? false
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitCommandComposite(this)
  }
}

export class FragmentCompositeNode extends FragmentNode {
  readonly parts: (FragmentNode | string)[]
  readonly noSpace: boolean

  constructor(parts: (FragmentNode | string)[], sourceBlockId?: string | null, noSpace?: boolean) {
    super(sourceBlockId)
    this.parts = parts
    this.noSpace = noSpace ?? false
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitFragmentComposite(this)
  }
}

// Only internal functions for now
export class FunctionDefinitionNode extends IrNode {
  readonly name: string
  readonly bodyNodes: CommandNode[]

  constructor(name: string, bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.name = name
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitFunctionDefinition(this)
  }
}

export class FunctionCallNode extends FragmentNode {
  readonly name: string
  readonly procedure: ProcedureRegistryEntry | null

  constructor(name: string, procedure: ProcedureRegistryEntry | null, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.name = name
    this.procedure = procedure
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitFunctionCall(this)
  }
}

export class OnLoadNode extends IrNode {
  readonly bodyNodes: CommandNode[]

  constructor(bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitOnLoad(this)
  }
}

export class OnTickNode extends IrNode {
  readonly bodyNodes: CommandNode[]

  constructor(bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitOnTick(this)
  }
}

export class OnPlayerMinesBlockNode extends IrNode {
  readonly blockPredicate: LiteralStringNode
  readonly bodyNodes: CommandNode[]

  constructor(blockPredicate: LiteralStringNode, bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.blockPredicate = blockPredicate
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitOnPlayerMinesBlock(this)
  }
}

export class LiteralIntNode extends FragmentNode {
  readonly value: number

  constructor(value: number, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.value = value
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralInt(this)
  }
}

export class LiteralStringNode extends FragmentNode {
  readonly value: string

  constructor(value: string, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.value = value
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralString(this)
  }
}

export class LiteralPositionNode extends FragmentNode {
  readonly xNode: LiteralStringNode
  readonly yNode: LiteralStringNode
  readonly zNode: LiteralStringNode

  constructor(xNode: LiteralStringNode, yNode: LiteralStringNode, zNode: LiteralStringNode, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.xNode = xNode
    this.yNode = yNode
    this.zNode = zNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralPosition(this)
  }
}

export class LiteralRangeNode extends FragmentNode {
  readonly minNode: LiteralIntNode // TODO add number type (not just int)
  readonly maxNode: LiteralIntNode

  constructor(minNode: LiteralIntNode, maxNode: LiteralIntNode, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.minNode = minNode
    this.maxNode = maxNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralRange(this)
  }
}

export class LiteralRotationNode extends FragmentNode {
  readonly yawNode: LiteralStringNode
  readonly pitchNode: LiteralStringNode

  constructor(yawNode: LiteralStringNode, pitchNode: LiteralStringNode, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.yawNode = yawNode
    this.pitchNode = pitchNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitLiteralRotation(this)
  }
}

export abstract class BooleanNode extends FragmentNode {}

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

export class IfNode extends CommandNode {
  readonly conditionNode: BooleanNode
  readonly trueBodyNodes: CommandNode[]
  readonly falseBodyNodes: CommandNode[]

  constructor(conditionNode: BooleanNode, trueBodyNodes: CommandNode[], falseBodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.conditionNode = conditionNode
    this.trueBodyNodes = trueBodyNodes
    this.falseBodyNodes = falseBodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitIf(this)
  }
}

export class WhileNode extends CommandNode {
  readonly conditionNode: BooleanNode
  readonly bodyNodes: CommandNode[]

  constructor(conditionNode: BooleanNode, bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.conditionNode = conditionNode
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitWhile(this)
  }
}

export class VariableNode extends FragmentNode {
  readonly variableName: string

  constructor(variableName: string, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.variableName = variableName
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitVariable(this)
  }
}

export class TempVariableNode extends VariableNode { // Should this just be a VariableNode instead?
  constructor(variableName: string, sourceBlockId?: string | null) {
    super(variableName, sourceBlockId)
  }
}

export class VariableSetNode extends CommandNode {
  readonly variableNode: VariableNode
  readonly rightNode: OrParameter<VariableNode | LiteralIntNode>

  constructor(variableNode: VariableNode, rightNode: OrParameter<VariableNode | LiteralIntNode>, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.variableNode = variableNode
    this.rightNode = rightNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitVariableSet(this)
  }
}

export class VariableOperationNode extends CommandNode {
  readonly variableNode: VariableNode
  readonly opType: VariableOpType
  readonly rightNode: OrParameter<VariableNode | LiteralIntNode>

  constructor(variableNode: VariableNode, opType: VariableOpType, rightNode: OrParameter<VariableNode | LiteralIntNode>, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.variableNode = variableNode
    this.opType = opType
    this.rightNode = rightNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitVariableOperation(this)
  }
}

export class ProcedureDefinitionNode extends CommandNode {
  readonly procedureEntry: ProcedureRegistryEntry
  readonly bodyNodes: CommandNode[]

  constructor(procedureEntry: ProcedureRegistryEntry, bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.procedureEntry = procedureEntry
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitProcedureDefinition(this)
  }
}

export class ProcedureParameterNode extends FragmentNode {
  readonly parameterEntry: ProcedureParameterRegistryEntry

  constructor(parameterEntry: ProcedureParameterRegistryEntry, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.parameterEntry = parameterEntry
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitProcedureParameter(this)
  }
}

export class ProcedureCallArgumentNode extends FragmentNode {
  readonly parameterEntry: ProcedureParameterRegistryEntry
  readonly procedureEntry: ProcedureRegistryEntry
  // Right now the only parameter and variable type is integer; handle other types later.
  readonly valueNode: OrParameter<VariableNode | LiteralIntNode>

  constructor(parameterEntry: ProcedureParameterRegistryEntry, procedureEntry: ProcedureRegistryEntry, valueNode: OrParameter<LiteralIntNode>, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.parameterEntry = parameterEntry
    this.procedureEntry = procedureEntry
    this.valueNode = valueNode
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitProcedureCallArgument(this)
  }
}

export class ProcedureCallNode extends CommandNode {
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

export class ItemStackNode extends FragmentNode {
  readonly itemStackData: ItemStackEditorResult

  constructor(itemStackData: ItemStackEditorResult, sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.itemStackData = itemStackData
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitItemStack(this)
  }
}

export class TargetSelectorNode extends FragmentNode {
  readonly targetCategory: string
  readonly clauseNodes: FragmentCompositeNode[]

  constructor(targetCategory: string, clauseNodes: FragmentCompositeNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.targetCategory = targetCategory
    this.clauseNodes = clauseNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitTargetSelector(this)
  }
}

export class ExecuteNode extends CommandNode {
  readonly clauseNodes: FragmentCompositeNode[]
  readonly bodyNodes: CommandNode[]

  constructor(clauseNodes: FragmentCompositeNode[], bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.clauseNodes = clauseNodes
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitExecute(this)
  }
}

export class RaycastEntityNode extends CommandNode {
  readonly targetNode: TargetSelectorNode
  readonly distanceNode: LiteralIntNode
  readonly bodyNodes: CommandNode[]

  constructor(targetNode: TargetSelectorNode, distanceNode: LiteralIntNode, bodyNodes: CommandNode[], sourceBlockId?: string | null) {
    super(sourceBlockId)
    this.targetNode = targetNode
    this.distanceNode = distanceNode
    this.bodyNodes = bodyNodes
  }

  accept<T>(visitor: IrVisitor<T>): T {
    return visitor.visitRaycastEntity(this)
  }
}
