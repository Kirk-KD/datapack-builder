import {
  BooleanNode,
  CommandCompositeNode, CommandNode,
  DatapackNode,
  ExecuteNode,
  FragmentCompositeNode, FragmentNode,
  IfNode,
  IrNode,
  type IrVisitor, ItemStackNode, LiteralIntNode, LiteralPositionNode, LiteralRangeNode, LiteralRotationNode,
  LiteralStringNode, OnLoadNode, OnTickNode,
  type OrParameter, ProcedureCallArgumentNode, ProcedureCallNode, ProcedureDefinitionNode,
  ProcedureParameterNode, TargetSelectorNode, TempVariableNode,
  type TopLevelNode, VariableCompareNode, VariableMatchesNode, VariableNode,
  VariableOperationNode, VariableSetNode, WhileNode
} from '../ir'
import {Naming} from '../emitter/naming.ts'
import type {ProjectConfig} from '../../../stores'

/**
 * The result of a lowering pass visit on an IR node. Contains the transformed node
 * and any commands that must be inserted before it in the nearest enclosing command
 * list.
 *
 * `pre` exists because some nodes produce setup commands as a side effect of
 * lowering — for example, a VariableCompareNode with a literal right side must
 * initialize a temp scoreboard variable before the command that uses it.
 * Since commands cannot be inserted inside expressions, they are carried upward
 * through the tree via `pre` until they reach a command list that can consume them.
 *
 * ## Rules for implementing IrVisitor<LoweredResult>:
 *
 * **If a node visits CommandNode children (body lists):**
 * Call `lowerBody()` on the list. This is the only place `pre` is consumed —
 * each command's `pre` is inserted immediately before that command in the result.
 *
 * **If a node visits non-CommandNode children (conditions, fragments, clauses):**
 * Collect their `pre` and bubble it upward via this node's own `LoweredResult.pre`.
 * It cannot be consumed here because there is no command list to insert into.
 *
 * **If a node has no children:**
 * Return `{ pre: [], node }` — nothing to visit, nothing to hoist.
 *
 * `pre` must never be silently dropped. If a visit method calls `accept()` on any
 * child, it is responsible for either consuming or forwarding that child's `pre`.
 */
interface LoweredResult {
  pre: CommandNode[]
  node: IrNode
}

export class LoweringPass implements IrVisitor<LoweredResult> {
  naming: Naming
  // TODO temp variable manager

  constructor(projectConfig: ProjectConfig) {
    this.naming = new Naming(projectConfig)
  }

  run(node: DatapackNode): DatapackNode {
    return this.visitDatapack(node).node as DatapackNode
  }

  /**
   * Processes a flat list of command nodes through the lowering pass, resolving any
   * nodes that require commands to be hoisted. For each command, any `pre` commands
   * produced by the lowering pass are inserted immediately before that command in the
   * result list.
   *
   * Example: a VariableCompareNode with a literal right side produces a
   * ScoreboardSetNode in `pre`. That setup command is inserted before the IfNode
   * that contains the comparison, ensuring the temp variable is initialized before
   * it is referenced.
   *
   * This must be called on every body node list (IfNode, WhileNode, OnTickNode, etc.)
   * to ensure hoisted commands are not lost.
   *
   * @param commands The body nodes of a node
   * @private
   */
  private lowerBody(commands: CommandNode[]): CommandNode[] {
    const result: CommandNode[] = []
    for (const cmd of commands) {
      const lowered = cmd.accept(this)
      result.push(...lowered.pre)
      result.push(lowered.node as CommandNode)
    }
    return result
  }

  visitCommandComposite(node: CommandCompositeNode): LoweredResult {
    const pre: CommandNode[] = []
    const parts: (FragmentNode | string)[] = []
    for (const part of node.parts) {
      if (typeof part === 'string') {
        parts.push(part)
      } else {
        const lowered = part.accept(this)
        pre.push(...lowered.pre)
        parts.push(lowered.node as FragmentNode)
      }
    }
    return {
      pre,
      node: new CommandCompositeNode(parts, node.sourceBlockId)
    }
  }

  visitDatapack(node: DatapackNode): LoweredResult {
    return {
      pre: [],
      node: new DatapackNode(
        node.topLevelNodes.map(n => n.accept(this).node as TopLevelNode)
      )
    }
  }

  visitExecute(node: ExecuteNode): LoweredResult {
    const pre: CommandNode[] = []
    const clauses: FragmentCompositeNode[] = []
    for (const clause of node.clauseNodes) {
      const lowered = clause.accept(this)
      pre.push(...lowered.pre)
      clauses.push(lowered.node as FragmentCompositeNode)
    }
    return {
      pre,
      node: new ExecuteNode(
        clauses,
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )
    }
  }

  visitFragmentComposite(node: FragmentCompositeNode): LoweredResult {
    const pre: CommandNode[] = []
    const parts: (FragmentNode | string)[] = []
    for (const part of node.parts) {
      if (typeof part === 'string') {
        parts.push(part)
      } else {
        const lowered = part.accept(this)
        pre.push(...lowered.pre)
        parts.push(lowered.node as FragmentNode)
      }
    }
    return {
      pre,
      node: new FragmentCompositeNode(parts, node.sourceBlockId)
    }
  }

  visitIf(node: IfNode): LoweredResult {
    const condition = node.conditionNode.accept(this)
    return {
      pre: condition.pre,
      node: new IfNode(
        condition.node as BooleanNode,
        this.lowerBody(node.trueBodyNodes),
        this.lowerBody(node.falseBodyNodes),
        node.sourceBlockId
      )
    }
  }

  visitItemStack(node: ItemStackNode): LoweredResult {
    return { pre: [], node }
  }

  visitLiteralInt(node: LiteralIntNode): LoweredResult {
    return { pre: [], node }
  }

  visitLiteralPosition(node: LiteralPositionNode): LoweredResult {
    const x = node.xNode.accept(this)
    const y = node.yNode.accept(this)
    const z = node.zNode.accept(this)
    return {
      pre: [...x.pre, ...y.pre, ...z.pre],
      node: new LiteralPositionNode(
        x.node as LiteralStringNode,
        y.node as LiteralStringNode,
        z.node as LiteralStringNode,
        node.sourceBlockId
      )
    }
  }

  visitLiteralRange(node: LiteralRangeNode): LoweredResult {
    const min = node.minNode.accept(this)
    const max = node.maxNode.accept(this)
    return {
      pre: [...min.pre, ...max.pre],
      node: new LiteralRangeNode(
        min.node as LiteralIntNode,
        max.node as LiteralIntNode,
        node.sourceBlockId
      )
    }
  }

  visitLiteralRotation(node: LiteralRotationNode): LoweredResult {
    const yaw = node.yawNode.accept(this)
    const pitch = node.pitchNode.accept(this)
    return {
      pre: [...yaw.pre, ...pitch.pre],
      node: new LiteralRotationNode(
        yaw.node as LiteralStringNode,
        pitch.node as LiteralStringNode,
        node.sourceBlockId
      )
    }
  }

  visitLiteralString(node: LiteralStringNode): LoweredResult {
    return { pre: [], node }
  }

  visitOnLoad(node: OnLoadNode): LoweredResult {
    return {
      pre: [],
      node: new OnLoadNode(
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )
    }
  }

  visitOnTick(node: OnTickNode): LoweredResult {
    return {
      pre: [],
      node: new OnTickNode(
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )
    }
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
    const pre: CommandNode[] = []
    const clauses: FragmentCompositeNode[] = []
    for (const clause of node.clauseNodes) {
      const lowered = clause.accept(this)
      pre.push(...lowered.pre)
      clauses.push(lowered.node as FragmentCompositeNode)
    }
    return {
      pre,
      node: new TargetSelectorNode(node.targetCategory, clauses, node.sourceBlockId)
    }
  }

  visitTempVariable(node: TempVariableNode): LoweredResult {
    return { pre: [], node }
  }

  visitVariable(node: VariableNode): LoweredResult {
    return { pre: [], node }
  }

  visitVariableSet(node: VariableSetNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)
    return {
      pre: [...variable.pre, ...right.pre],
      node: new VariableSetNode(
        variable.node as VariableNode,
        right.node as OrParameter<LiteralIntNode | VariableNode>,
        node.sourceBlockId
      )
    }
  }

  visitVariableCompare(node: VariableCompareNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)

    if (right.node instanceof LiteralIntNode) {
      return {
        pre: [
          ...variable.pre,
          ...right.pre,
          new VariableSetNode(
            new TempVariableNode(),
            right.node as OrParameter<VariableNode | LiteralIntNode>
          )
        ],
        node: new VariableCompareNode(
          variable.node as VariableNode,
          node.op,
          new TempVariableNode(),
          node.sourceBlockId
        )
      }
    }

    return {
      pre: [...variable.pre, ...right.pre],
      node: new VariableCompareNode(
        variable.node as VariableNode,
        node.op,
        right.node as OrParameter<VariableNode | LiteralIntNode>,
        node.sourceBlockId
      )
    }
  }

  visitVariableMatches(node: VariableMatchesNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const range = node.rangeNode.accept(this)
    return {
      pre: [...variable.pre, ...range.pre],
      node: new VariableMatchesNode(
        variable.node as VariableNode,
        range.node as LiteralRangeNode,
        node.sourceBlockId
      )
    }
  }

  visitVariableOperation(node: VariableOperationNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)

    if (right.node instanceof LiteralIntNode && (node.opType === '*=' || node.opType === '/=' || node.opType === '%=')) {
      return {
        pre: [...variable.pre, ...right.pre, new VariableSetNode(new TempVariableNode(), right.node)],
        node: new VariableOperationNode(
          variable.node as VariableNode,
          node.opType,
          new TempVariableNode(),
          node.sourceBlockId
        )
      }
    }

    return {
      pre: [...variable.pre, ...right.pre],
      node: new VariableOperationNode(
        variable.node as VariableNode,
        node.opType,
        right.node as OrParameter<VariableNode | LiteralIntNode>,
        node.sourceBlockId
      )
    }
  }

  visitWhile(node: WhileNode): LoweredResult {
    const condition = node.conditionNode.accept(this)
    return {
      pre: condition.pre,
      node: new WhileNode(
        condition.node as BooleanNode,
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )
    }
  }
}