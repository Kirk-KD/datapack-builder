import {
  CommandCompositeNode,
  CommandNode,
  DatapackNode,
  ExecuteNode,
  FragmentCompositeNode,
  FragmentNode,
  FunctionCallNode,
  FunctionDefinitionNode,
  FunctionTagNode,
  IfNode,
  IrNode,
  type IrVisitor,
  ItemStackNode,
  LiteralIntNode,
  LiteralPositionNode,
  LiteralRangeNode,
  LiteralRotationNode,
  LiteralStringNode,
  NumberNode,
  OnLoadNode,
  OnPlayerMinesBlockNode,
  OnTickNode,
  OptNumberNode,
  type OrParameter,
  ProcedureCallArgumentNode,
  ProcedureCallNode,
  ProcedureDefinitionNode,
  ProcedureParameterNode,
  RaycastBlockNode,
  RaycastEntityNode,
  TargetSelectorNode,
  TempVariableNode,
  TildeNode,
  CaretNode,
  type TopLevelNode,
  VariableCompareNode,
  VariableMatchesNode,
  VariableNode,
  VariableOperationNode,
  VariableSetNode,
  WhileNode,
  type PositionComponentNode,
  type RangeComponentNode,
  type RotationComponentNode,
  ConstantsNode, ConstantDefNode, ConstantGetNode
} from '../ir'
import {Naming} from '../emitter/naming.ts'
import type {ProjectConfig} from '../../../stores'

/**
 * The result of a lowering pass visit on an IR node. Contains the transformed nodes
 * and any commands that must be inserted before them in the nearest enclosing command
 * list.
 *
 * `pre` exists because some nodes produce setup commands as a side effect of
 * lowering. For example, a VariableCompareNode with a literal right side must
 * initialize a temp scoreboard variable before the command that uses it.
 * Since commands cannot be inserted inside expressions, they are carried upward
 * through the tree via `pre` until they reach a command list that can consume them.
 *
 * ## Rules for implementing `IrVisitor<LoweredResult>`:
 *
 * **If a node visits CommandNode children (body lists):**
 * Call `lowerBody()` on the list. This is the only place `pre` is consumed;
 * each command's `pre` is inserted immediately before that command in the result.
 *
 * **If a node visits non-CommandNode children (conditions, fragments, clauses):**
 * Collect their `pre` and bubble it upward via this node's own `LoweredResult.pre`.
 * It cannot be consumed here because there is no command list to insert into.
 *
 * **If a node has no children:**
 * Return `{ pre: [], nodes: [node] }`: nothing to visit, nothing to hoist.
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
  private readonly constantDefs = new Map<string, ConstantDefNode>()
  private readonly resolvingConstants: string[] = []

  /**
   * Returns the next temporary scoreboard variable name to be passed to `new TempVariableNode(...)`.
   * It does not return the `TempVariableNode` reference; it is the responsibility of this method's consumers to create
   * the `TempVariableNode` and pass the correct source block ID.
   */
  nextTempName() {
    return this.naming.nextId('TEMP')
  }

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

  private createRaycastEntity(options: {
    target: TargetSelectorNode | string
    distance: LiteralIntNode | string
    bodyNodes: CommandNode[]
    baseName: string
    sourceBlockId?: string | null
  }): LoweredResult {
    const targetPre: CommandNode[] = []
    const distancePre: CommandNode[] = []
    const targetParts: (FragmentNode | string)[] = []
    const distanceParts: (FragmentNode | string)[] = []

    if (typeof options.target === 'string') {
      targetParts.push(options.target)
    } else {
      const loweredTarget = options.target.accept(this)
      targetPre.push(...loweredTarget.pre)
      targetParts.push(...loweredTarget.nodes as FragmentNode[])
    }

    if (typeof options.distance === 'string') {
      distanceParts.push(options.distance)
    } else {
      const loweredDistance = options.distance.accept(this)
      distancePre.push(...loweredDistance.pre)
      distanceParts.push(...loweredDistance.nodes as FragmentNode[])
    }

    const bodyFuncName = `${options.baseName}_body`
    const raycastFuncName = `${options.baseName}_cast`
    const hitFlagName = this.naming.variableName(`${options.baseName}_hitFlag`)

    return {
      pre: [...targetPre, ...distancePre],
      nodes: [
        // Define body mcfunction (runs on hit)
        new FunctionDefinitionNode(bodyFuncName, [
          // Set hit flag
          new CommandCompositeNode([
            'scoreboard players set', hitFlagName, this.naming.variableObjectiveName(), '1'
          ], options.sourceBlockId),
          // Execute body commands
          ...this.lowerBody(options.bodyNodes)
        ], null, options.sourceBlockId),

        // Define raycast mcfunction (checks for hit and advances the ray)
        new FunctionDefinitionNode(raycastFuncName, [
          new CommandCompositeNode([
            // Hit
            'execute at', ...targetParts,
            // Run at hit position
            'run', new FunctionCallNode(bodyFuncName, null, options.sourceBlockId)
          ], options.sourceBlockId),

          new CommandCompositeNode([
            // Not yet hit
            `execute unless score ${hitFlagName} ${this.naming.variableObjectiveName()} matches 1 `,
            // Advance by 0.25 blocks
            'positioned ^ ^ ^0.25 ',
            // Not out of range
            'if entity @s[distance=..', ...distanceParts, '] ',
            // Recurse
            'run ', new FunctionCallNode(raycastFuncName, null, options.sourceBlockId),
          ], options.sourceBlockId, true)
        ], null, options.sourceBlockId),

        // Initialize hit flag
        new CommandCompositeNode([
          'scoreboard players set', hitFlagName, this.naming.variableObjectiveName(), '0'
        ], options.sourceBlockId),

        // Begin raycast
        new CommandCompositeNode([
          `execute anchored eyes positioned ^ ^ ^ run`,
          new FunctionCallNode(raycastFuncName, null, options.sourceBlockId)
        ], options.sourceBlockId)
      ]
    }
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
      nodes: [new CommandCompositeNode(parts, node.sourceBlockId, node.noSpace)]
    }
  }

  visitFunctionCall(node: FunctionCallNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitDatapack(node: DatapackNode): LoweredResult {
    const topLevelNodes: TopLevelNode[] = []
    for (const topLevelNode of node.topLevelNodes) {
      if (topLevelNode instanceof ConstantsNode) {
        topLevelNode.accept(this)
      }
    }
    for (const topLevelNode of node.topLevelNodes) {
      if (topLevelNode instanceof ConstantsNode) continue
      const lowered = topLevelNode.accept(this)
      topLevelNodes.push(...lowered.nodes as TopLevelNode[])
    }
    return {
      pre: [],
      nodes: [new DatapackNode(topLevelNodes)]
    }
  }

  visitFunctionTag(node: FunctionTagNode): LoweredResult {
    return {
      pre: [],
      nodes: [node]
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

    const bodyFuncName = this.naming.nextId('execute_body')

    return {
      pre,
      nodes: [
        new FunctionDefinitionNode(bodyFuncName, this.lowerBody(node.bodyNodes), null, node.sourceBlockId),
        new CommandCompositeNode([
          'execute',
          ...clauses,
          'run',
          new FunctionCallNode(bodyFuncName, null, node.sourceBlockId)
        ], node.sourceBlockId)
      ]
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
      nodes: [new FragmentCompositeNode(parts, node.sourceBlockId, node.noSpace)]
    }
  }

  visitIf(node: IfNode): LoweredResult {
    const condition = node.conditionNode.accept(this)

    const trueFuncName = node.trueBodyNodes.length ? this.naming.nextId('if_true') : null
    const falseFuncName = node.falseBodyNodes.length ? this.naming.nextId('if_false') : null

    if (!trueFuncName && !falseFuncName) return { pre: condition.pre, nodes: [] }

    return {
      pre: condition.pre,
      nodes: [
        trueFuncName ? new FunctionDefinitionNode(trueFuncName, this.lowerBody(node.trueBodyNodes), null, node.sourceBlockId) : null,
        falseFuncName ? new FunctionDefinitionNode(falseFuncName, this.lowerBody(node.falseBodyNodes), null, node.sourceBlockId) : null,
        trueFuncName ? new CommandCompositeNode([
          'execute if',
          condition.nodes[0],
          'run',
          new FunctionCallNode(trueFuncName, null, node.sourceBlockId)
        ]) : null,
        falseFuncName ? new CommandCompositeNode([
          'execute unless',
          condition.nodes[0],
          'run',
          new FunctionCallNode(falseFuncName, null, node.sourceBlockId)
        ]) : null,
      ].filter(n => n !== null)
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
        x.nodes[0] as OrParameter<PositionComponentNode>,
        y.nodes[0] as OrParameter<PositionComponentNode>,
        z.nodes[0] as OrParameter<PositionComponentNode>,
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
        min.nodes[0] as OrParameter<RangeComponentNode>,
        max.nodes[0] as OrParameter<RangeComponentNode>,
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
        yaw.nodes[0] as OrParameter<RotationComponentNode>,
        pitch.nodes[0] as OrParameter<RotationComponentNode>,
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
      nodes: [
        new FunctionDefinitionNode('load', this.lowerBody(node.bodyNodes), null, node.sourceBlockId),
        new FunctionTagNode('load', 'load', node.sourceBlockId)
      ]
    }
  }

  visitOnTick(node: OnTickNode): LoweredResult {
    return {
      pre: [],
      nodes: [
        new FunctionDefinitionNode('tick', this.lowerBody(node.bodyNodes), null, node.sourceBlockId),
        new FunctionTagNode('tick', 'tick', node.sourceBlockId)
      ]
    }
  }

  visitOnPlayerMinesBlock(node: OnPlayerMinesBlockNode): LoweredResult {
    const baseName = this.naming.nextId('on_player_mines_block')
    const raycastBaseName = `${baseName}_raycast`

    const minedObjName = `${baseName}_mined`

    const loadFuncName = `${baseName}_load`
    const raycastFuncName = `${baseName}_raycast`
    const tickFuncName = `${baseName}_tick`

    const raycast = this.createRaycastEntity({
      target: '@e[type=item,limit=1,sort=nearest,distance=..1,nbt={Age:0s}]',
      distance: '64',
      // The actual body commands of the on block broken event are here
      bodyNodes: this.lowerBody(node.bodyNodes),
      baseName: raycastBaseName
    })

    return {
      pre: [],
      nodes: [
        // Initialize scoreboard objectives
        new FunctionDefinitionNode(loadFuncName, [
          new CommandCompositeNode([
            `scoreboard objectives remove ${minedObjName}`
          ], node.sourceBlockId),
          new CommandCompositeNode([
            `scoreboard objectives add ${minedObjName} minecraft.mined:minecraft.`, node.blockPredicate
          ], node.sourceBlockId, true),
        ], null, node.sourceBlockId),

        // Define a wrapper function for raycast
        new FunctionDefinitionNode(raycastFuncName, raycast.nodes as CommandNode[], null, node.sourceBlockId),

        // A block was broken if objective isn't 0
        new FunctionDefinitionNode(tickFuncName, [
          // Run raycast
          new CommandCompositeNode([
            `execute as @a[scores={${minedObjName}=1..}] at @s run`,
            new FunctionCallNode(raycastFuncName, null, node.sourceBlockId)
          ], node.sourceBlockId),
          new CommandCompositeNode([
            `scoreboard players reset @a ${minedObjName}`
          ], node.sourceBlockId),
        ], null, node.sourceBlockId),

        // Register function tags
        new FunctionTagNode('load', loadFuncName, node.sourceBlockId),
        new FunctionTagNode('tick', tickFuncName, node.sourceBlockId),
      ]
    }
  }

  visitProcedureCall(node: ProcedureCallNode): LoweredResult {
    const pre: CommandNode[] = []
    for (const argumentNode of node.argumentNodes) {
      const lowered = argumentNode.accept(this)
      pre.push(...lowered.pre)
    }

    return {
      pre: [...pre],
      nodes: [
        new CommandCompositeNode([
          new FunctionCallNode(this.naming.procedureName(node.procedureEntry.name), node.procedureEntry, node.sourceBlockId),
          ...(node.argumentNodes.length ? [
            'with storage',
            this.naming.procedureStorageName(node.procedureEntry.name)
          ] : [])
        ], node.sourceBlockId)
      ]
    }
  }

  visitProcedureCallArgument(node: ProcedureCallArgumentNode): LoweredResult {
    const value = node.valueNode.accept(this)
    const storageName = this.naming.procedureStorageName(node.procedureEntry.name)
    const storagePath = this.naming.procedureStoragePath(node.parameterEntry.name)

    if (value.nodes[0] instanceof VariableNode) {
      return {
        pre: [
          ...value.pre,
          new CommandCompositeNode([
            'execute store result storage',
            storageName,
            storagePath,
            'int 1 run scoreboard players get',
            value.nodes[0],
          ], node.sourceBlockId)
        ],
        nodes: []
      }
    } else {
      return {
        pre: [
          ...value.pre,
          new CommandCompositeNode([
            'data modify storage',
            storageName,
            storagePath,
            'set value',
            // TODO handle adding quotes; right now it's fine because only integers
            value.nodes[0],
          ], node.sourceBlockId)
        ],
        nodes: []
      }
    }
  }

  visitProcedureDefinition(node: ProcedureDefinitionNode): LoweredResult {
    return {
      pre: [],
      nodes: [
        new FunctionDefinitionNode(
          this.naming.procedureName(node.procedureEntry.name),
          this.lowerBody(node.bodyNodes),
          node.procedureEntry,
          node.sourceBlockId
        )
      ]
    }
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

    if (right.nodes[0] instanceof VariableNode) {
      return {
        pre: [...variable.pre, ...right.pre],
        nodes: [
          new CommandCompositeNode([
            'scoreboard players operation',
            variable.nodes[0],
            '=',
            right.nodes[0]
          ], node.sourceBlockId)
        ]
      }
    }

    return {
      pre: [...variable.pre, ...right.pre],
      nodes: [
        new CommandCompositeNode([
          'scoreboard players set',
          variable.nodes[0],
          right.nodes[0]
        ], node.sourceBlockId)
      ]
    }
  }

  visitVariableCompare(node: VariableCompareNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)

    if (right.nodes[0] instanceof LiteralIntNode) {
      const tempVarName = this.nextTempName()
      const tempVarSet = new VariableSetNode(
        new TempVariableNode(tempVarName, node.sourceBlockId),
        right.nodes[0] as LiteralIntNode,
        node.sourceBlockId
      ).accept(this)

      return {
        pre: [
          ...variable.pre,
          ...right.pre,
          ...tempVarSet.pre,
          tempVarSet.nodes[0] as CommandNode
        ],
        nodes: [
          new FragmentCompositeNode([
            'score',
            variable.nodes[0] as VariableNode,
            node.op as string,
            new TempVariableNode(tempVarName, node.sourceBlockId)
          ], node.sourceBlockId)
        ]
      }
    }

    return {
      pre: [...variable.pre, ...right.pre],
      nodes: [
        new FragmentCompositeNode([
          'score',
          variable.nodes[0] as VariableNode,
          node.op as string,
          right.nodes[0]
        ], node.sourceBlockId)
      ]
    }
  }

  visitVariableMatches(node: VariableMatchesNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const range = node.rangeNode.accept(this)
    return {
      pre: [...variable.pre, ...range.pre],
      nodes: [new FragmentCompositeNode(
        [
          'score',
          variable.nodes[0] as VariableNode,
          'matches',
          range.nodes[0] as LiteralRangeNode,
        ],
        node.sourceBlockId
      )]
    }
  }

  visitVariableOperation(node: VariableOperationNode): LoweredResult {
    const variable = node.variableNode.accept(this)
    const right = node.rightNode.accept(this)

    if (!(right.nodes[0] instanceof VariableNode)) {
      if (node.opType === '*=' || node.opType === '/=' || node.opType === '%=') {
        const tempVarName = this.nextTempName()
        const tempVarSet = new VariableSetNode(
          new TempVariableNode(tempVarName, node.sourceBlockId),
          right.nodes[0] as OrParameter<LiteralIntNode>,
          node.sourceBlockId
        ).accept(this)

        return {
          pre: [...variable.pre, ...right.pre, ...tempVarSet.pre, tempVarSet.nodes[0] as CommandNode],
          nodes: [new CommandCompositeNode([
            'scoreboard players operation',
            variable.nodes[0],
            node.opType,
            new TempVariableNode(tempVarName, node.sourceBlockId)
          ], node.sourceBlockId)]
        }
      } else {
        return {
          pre: [...variable.pre, ...right.pre],
          nodes: [new CommandCompositeNode([
            'scoreboard players',
            node.opType === '+=' ? 'add' : 'remove',
            variable.nodes[0],
            right.nodes[0]
          ], node.sourceBlockId)]
        }
      }
    }

    return {
      pre: [...variable.pre, ...right.pre],
      nodes: [new CommandCompositeNode([
        'scoreboard players operation',
        variable.nodes[0],
        node.opType,
        right.nodes[0]
      ], node.sourceBlockId)]
    }
  }

  visitWhile(node: WhileNode): LoweredResult {
    const condition = node.conditionNode.accept(this)
    const whileFuncName = this.naming.nextId('while')
    const whileBodyFuncName = this.naming.nextId('while_body')

    return {
      pre: [],
      nodes: [
        new FunctionDefinitionNode(
          whileFuncName,
          [
            ...condition.pre,
            new CommandCompositeNode([
              'execute', 'if', condition.nodes[0],
              'run', new FunctionCallNode(whileBodyFuncName, null, node.sourceBlockId)
            ], node.sourceBlockId)
          ],
          null,
          node.sourceBlockId
        ),
        new FunctionDefinitionNode(
          whileBodyFuncName,
          [
            ...this.lowerBody(node.bodyNodes),
            new CommandCompositeNode([
              new FunctionCallNode(whileFuncName, null, node.sourceBlockId)
            ], node.sourceBlockId)
          ],
          null,
          node.sourceBlockId
        ),
        new CommandCompositeNode([
          new FunctionCallNode(whileFuncName, null, node.sourceBlockId)
        ], node.sourceBlockId)
      ]
    }
  }

  visitRaycastEntity(node: RaycastEntityNode): LoweredResult {
    return this.createRaycastEntity({
      target: node.targetNode,
      distance: node.distanceNode,
      bodyNodes: node.bodyNodes,
      baseName: this.naming.nextId('raycast'),
      sourceBlockId: node.sourceBlockId
    })
  }

  visitRaycastBlock(node: RaycastBlockNode): LoweredResult {
    const block = node.blockNode.accept(this)
    const distance = node.distanceNode.accept(this)

    const baseName = this.naming.nextId('raycast')
    const bodyFuncName = `${baseName}_body`
    const raycastFuncName = `${baseName}_cast`
    const hitFlagName = this.naming.variableName(`${baseName}_hitFlag`)

    return {
      pre: [...block.pre, ...distance.pre],
      nodes: [
        // Define body mcfunction (runs on hit)
        new FunctionDefinitionNode(bodyFuncName, [
          // Set hit flag
          new CommandCompositeNode([
            'scoreboard players set', hitFlagName, this.naming.variableObjectiveName(), '1'
          ], node.sourceBlockId),
          // Execute body commands
          ...this.lowerBody(node.bodyNodes)
        ], null, node.sourceBlockId),

        // Define raycast mcfunction (checks for hit and advances the ray)
        new FunctionDefinitionNode(raycastFuncName, [
          new CommandCompositeNode([
            'execute if block ~ ~ ~', ...block.nodes,
            'run', new FunctionCallNode(bodyFuncName, null, node.sourceBlockId)
          ], node.sourceBlockId),

          new CommandCompositeNode([
            // Not yet hit
            `execute unless score ${hitFlagName} ${this.naming.variableObjectiveName()} matches 1 `,
            // Advance by 0.1 blocks
            'positioned ^ ^ ^0.1 ',
            // Not out of range
            'if entity @s[distance=..', ...distance.nodes, '] ',
            // Recurse
            'run ', new FunctionCallNode(raycastFuncName, null, node.sourceBlockId),
          ], node.sourceBlockId, true)
        ], null, node.sourceBlockId),

        // Initialize hit flag
        new CommandCompositeNode([
          'scoreboard players set', hitFlagName, this.naming.variableObjectiveName(), '0'
        ], node.sourceBlockId),

        // Begin raycast
        new CommandCompositeNode([
          `execute anchored eyes positioned ^ ^ ^ run`,
          new FunctionCallNode(raycastFuncName, null, node.sourceBlockId)
        ], node.sourceBlockId)
      ]
    }
  }

  visitNumber(node: NumberNode): LoweredResult {
    return { pre: [], nodes: [node] }
  }

  visitOptNumber(node: OptNumberNode): LoweredResult {
    return {
      pre: [],
      nodes: [node.value === null ? new FragmentCompositeNode(['']) : new NumberNode(node.value, node.sourceBlockId)]
    }
  }

  visitTilde(node: TildeNode): LoweredResult {
    const value = node.valueNode.accept(this)
    return {
      pre: [...value.pre],
      nodes: [
        new FragmentCompositeNode(
          ['~', ...value.nodes],
          node.sourceBlockId,
          true
        )
      ]
    }
  }

  visitCaret(node: CaretNode): LoweredResult {
    const value = node.valueNode.accept(this)
    return {
      pre: [...value.pre],
      nodes: [
        new FragmentCompositeNode(
          ['^', ...value.nodes],
          node.sourceBlockId,
          true
        )
      ]
    }
  }

  visitConstants(node: ConstantsNode): LoweredResult {
    for (const constantDefNode of node.constantDefNodes) {
      constantDefNode.accept(this)
    }
    return { pre: [], nodes: [] }
  }

  visitConstantDef(node: ConstantDefNode): LoweredResult {
    this.constantDefs.set(node.constantEntry.name, node)
    return { pre: [], nodes: [] }
  }

  visitConstantGet(node: ConstantGetNode): LoweredResult {
    const constantName = node.constantEntry.name
    const constantDef = this.constantDefs.get(constantName)
    if (!constantDef) {
      throw new Error(`Constant "${constantName}" is not defined.`)
    }

    if (this.resolvingConstants.includes(constantName)) {
      const cycleStart = this.resolvingConstants.indexOf(constantName)
      const cycle = [...this.resolvingConstants.slice(cycleStart), constantName]
      throw new Error(`Circular constant reference: ${cycle.join(' -> ')}`)
    }

    this.resolvingConstants.push(constantName)
    try {
      return constantDef.valueNode.accept(this)
    }
    finally {
      this.resolvingConstants.pop()
    }
  }
}
