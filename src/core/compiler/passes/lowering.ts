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
 * The result of a lowering pass visit on an IR node. Contains the transformed nodes
 * and any commands that must be inserted before them in the nearest enclosing command
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
 * Return `{ pre: [], nodes: [node] }` — nothing to visit, nothing to hoist.
 *
 * `pre` must never be silently dropped. If a visit method calls `accept()` on any
 * child, it is responsible for either consuming or forwarding that child's `pre`.
 */
interface LoweredResult {
  pre: CommandNode[]
  nodes: IrNode[]
}

export class LoweringPass implements IrVisitor<LoweredResult> {
  naming: Naming
  // TODO temp variable manager

  constructor(projectConfig: ProjectConfig) {
    this.naming = new Naming(projectConfig)
  }

  run(node: DatapackNode): DatapackNode {
    return this.visitDatapack(node).nodes[0] as DatapackNode
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
      result.push(...lowered.nodes as CommandNode[])
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
        parts.push(lowered.nodes[0] as FragmentNode)
      }
    }
    return {
      pre,
      nodes: [new CommandCompositeNode(parts, node.sourceBlockId)]
    }
  }

  visitDatapack(node: DatapackNode): LoweredResult {
    const topLevelNodes: TopLevelNode[] = []
    for (const topLevelNode of node.topLevelNodes) {
      const lowered = topLevelNode.accept(this)
      topLevelNodes.push(...lowered.nodes as TopLevelNode[])
    }
    return {
      pre: [],
      nodes: [new DatapackNode(topLevelNodes)]
    }
  }

  visitExecute(node: ExecuteNode): LoweredResult {
    const pre: CommandNode[] = []
    const clauses: FragmentCompositeNode[] = []
    for (const clause of node.clauseNodes) {
      const lowered = clause.accept(this)
      pre.push(...lowered.pre)
      clauses.push(lowered.nodes[0] as FragmentCompositeNode)
    }
    return {
      pre,
      nodes: [new ExecuteNode(
        clauses,
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )]
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
        parts.push(lowered.nodes[0] as FragmentNode)
      }
    }
    return {
      pre,
      nodes: [new FragmentCompositeNode(parts, node.sourceBlockId)]
    }
  }

  visitIf(node: IfNode): LoweredResult {
    const condition = node.conditionNode.accept(this)
    return {
      pre: condition.pre,
      nodes: [new IfNode(
        condition.nodes[0] as BooleanNode,
        this.lowerBody(node.trueBodyNodes),
        this.lowerBody(node.falseBodyNodes),
        node.sourceBlockId
      )]
    }
  }

  visitItemStack(node: ItemStackNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitLiteralInt(node: LiteralIntNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitLiteralPosition(node: LiteralPositionNode): LoweredResult {
    const x = node.xNode.accept(this)
    const y = node.yNode.accept(this)
    const z = node.zNode.accept(this)
    return {
      pre: [...x.pre, ...y.pre, ...z.pre],
      nodes: [new LiteralPositionNode(
        x.nodes[0] as LiteralStringNode,
        y.nodes[0] as LiteralStringNode,
        z.nodes[0] as LiteralStringNode,
        node.sourceBlockId
      )]
    }
  }

  visitLiteralRange(node: LiteralRangeNode): LoweredResult {
    const min = node.minNode.accept(this)
    const max = node.maxNode.accept(this)
    return {
      pre: [...min.pre, ...max.pre],
      nodes: [new LiteralRangeNode(
        min.nodes[0] as LiteralIntNode,
        max.nodes[0] as LiteralIntNode,
        node.sourceBlockId
      )]
    }
  }

  visitLiteralRotation(node: LiteralRotationNode): LoweredResult {
    const yaw = node.yawNode.accept(this)
    const pitch = node.pitchNode.accept(this)
    return {
      pre: [...yaw.pre, ...pitch.pre],
      nodes: [new LiteralRotationNode(
        yaw.nodes[0] as LiteralStringNode,
        pitch.nodes[0] as LiteralStringNode,
        node.sourceBlockId
      )]
    }
  }

  visitLiteralString(node: LiteralStringNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitOnLoad(node: OnLoadNode): LoweredResult {
    return {
      pre: [],
      nodes: [new OnLoadNode(
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )]
    }
  }

  visitOnTick(node: OnTickNode): LoweredResult {
    return {
      pre: [],
      nodes: [new OnTickNode(
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )]
    }
  }

  visitProcedureCall(node: ProcedureCallNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitProcedureCallArgument(node: ProcedureCallArgumentNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitProcedureDefinition(node: ProcedureDefinitionNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitProcedureParameter(node: ProcedureParameterNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitTargetSelector(node: TargetSelectorNode): LoweredResult {
    const pre: CommandNode[] = []
    const clauses: FragmentCompositeNode[] = []
    for (const clause of node.clauseNodes) {
      const lowered = clause.accept(this)
      pre.push(...lowered.pre)
      clauses.push(lowered.nodes[0] as FragmentCompositeNode)
    }
    return {
      pre,
      nodes: [new TargetSelectorNode(node.targetCategory, clauses, node.sourceBlockId)]
    }
  }

  visitTempVariable(node: TempVariableNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitVariable(node: VariableNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitVariableSet(node: VariableSetNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)
    return {
      pre: [...variable.pre, ...right.pre],
      nodes: [new VariableSetNode(
        variable.nodes[0] as VariableNode,
        right.nodes[0] as OrParameter<LiteralIntNode | VariableNode>,
        node.sourceBlockId
      )]
    }
  }

  visitVariableCompare(node: VariableCompareNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)

    if (right.nodes[0] instanceof LiteralIntNode) {
      return {
        pre: [
          ...variable.pre,
          ...right.pre,
          new VariableSetNode(
            new TempVariableNode(),
            right.nodes[0] as OrParameter<VariableNode | LiteralIntNode>
          )
        ],
        nodes: [new VariableCompareNode(
          variable.nodes[0] as VariableNode,
          node.op,
          new TempVariableNode(),
          node.sourceBlockId
        )]
      }
    }

    return {
      pre: [...variable.pre, ...right.pre],
      nodes: [new VariableCompareNode(
        variable.nodes[0] as VariableNode,
        node.op,
        right.nodes[0] as OrParameter<VariableNode | LiteralIntNode>,
        node.sourceBlockId
      )]
    }
  }

  visitVariableMatches(node: VariableMatchesNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const range = node.rangeNode.accept(this)
    return {
      pre: [...variable.pre, ...range.pre],
      nodes: [new VariableMatchesNode(
        variable.nodes[0] as VariableNode,
        range.nodes[0] as LiteralRangeNode,
        node.sourceBlockId
      )]
    }
  }

  visitVariableOperation(node: VariableOperationNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)

    if (right.nodes[0] instanceof LiteralIntNode && (node.opType === '*=' || node.opType === '/=' || node.opType === '%=')) {
      return {
        pre: [...variable.pre, ...right.pre, new VariableSetNode(new TempVariableNode(), right.nodes[0] as OrParameter<VariableNode | LiteralIntNode>)],
        nodes: [new VariableOperationNode(
          variable.nodes[0] as VariableNode,
          node.opType,
          new TempVariableNode(),
          node.sourceBlockId
        )]
      }
    }

    return {
      pre: [...variable.pre, ...right.pre],
      nodes: [new VariableOperationNode(
        variable.nodes[0] as VariableNode,
        node.opType,
        right.nodes[0] as OrParameter<VariableNode | LiteralIntNode>,
        node.sourceBlockId
      )]
    }
  }

  visitWhile(node: WhileNode): LoweredResult {
    const condition = node.conditionNode.accept(this)
    return {
      pre: condition.pre,
      nodes: [new WhileNode(
        condition.nodes[0] as BooleanNode,
        this.lowerBody(node.bodyNodes),
        node.sourceBlockId
      )]
    }
  }
}