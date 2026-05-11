import {
  DatapackNode, ItemStackNode, LiteralRotationNode, LiteralIntNode,
  LiteralPositionNode, LiteralRangeNode, LiteralStringNode,
  ProcedureParameterNode, TargetSelectorNode, VariableNode, CommandCompositeNode,
  FragmentCompositeNode, TempVariableNode, FunctionDefinitionNode, FunctionCallNode, FunctionTagNode, NumberNode
} from '../ir'
import {OutputFiles} from '../outputFiles.ts'
import {Naming} from './naming.ts'
import type {ProjectConfig} from '../../../stores'
import {compileEditorState} from './emitEditorState.ts'
import {SelectiveIrVisitor} from '../ir'
import {Segment} from '../mapping.ts'
import type {ProcedureRegistryEntry} from '../../blockly/registry'

export class Emitter extends SelectiveIrVisitor<Segment[]> {
  readonly files: OutputFiles
  readonly naming: Naming
  readonly projectConfig: ProjectConfig

  private parentProcedure: ProcedureRegistryEntry | null = null

  // Populated as the pass encounters `FunctionTagNode`s
  private loadFunctionNames: string[] = []
  private tickFunctionNames: string[] = []

  constructor(outputFiles: OutputFiles, projectConfig: ProjectConfig) {
    super()
    this.files = outputFiles
    this.projectConfig = projectConfig
    this.naming = new Naming(this.projectConfig)
  }

  visitCommandComposite(node: CommandCompositeNode): Segment[] {
    const res: Segment[] = []
    for (let i = 0; i < node.parts.length; i++) {
      if (i > 0 && !node.noSpace) res.push(new Segment(' ', node))
      const part = node.parts[i]
      if (typeof part === 'string') {
        res.push(new Segment(part, node))
      } else {
        res.push(...part.accept(this))
      }
    }
    res.push(new Segment('\n', node))
    return node.prefix(res)
  }

  visitFragmentComposite(node: FragmentCompositeNode): Segment[] {
    const res: Segment[] = []
    for (let i = 0; i < node.parts.length; i++) {
      if (i > 0 && !node.noSpace) res.push(new Segment(' ', node))
      const part = node.parts[i]
      if (typeof part === 'string') {
        res.push(new Segment(part, node))
      } else {
        res.push(...part.accept(this))
      }
    }
    return res
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Segment[] {
    // Update parent procedure to be this node's procedure if it is user-defined.
    if (node.procedure) this.parentProcedure = node.procedure
    const bodySegments = node.bodyNodes.flatMap(n => n.accept(this))
    if (node.procedure) this.parentProcedure = null

    this.files.with(this.naming.internalMcfunctionFilePath(node.name)).write(bodySegments)
    return []
  }

  visitFunctionCall(node: FunctionCallNode): Segment[] {
    // We are currently:
    // 1. Visiting a call to a generated mcfunction;
    // 2. Within a user-defined procedure body;
    // 3. The procedure has parameters,
    // We must pass the same argument storage reference to the generated mcfunction.
    let storage = ''
    if (!node.procedure && this.parentProcedure?.parameters.length)
      storage = ` with storage ${this.naming.procedureStorageName(this.parentProcedure.name)}`

    return [new Segment(
      `function ${this.naming.internalNamespace()}:${node.name}` + storage,
      node,
      this.naming.internalMcfunctionFilePath(node.name)
    )]
  }

  visitDatapack(node: DatapackNode): Segment[] {
    this.files.with('pack.mcmeta').write([new Segment(
      JSON.stringify({
        pack: {
          pack_format: this.projectConfig.packFormat,
          description: this.projectConfig.description
        }
      }, null, 2)
    )])

    // Nonsensical top-level nodes (e.g. nodes that aren't events or procedure definitions) are silently processed.
    // Should prevent this in the future.
    node.topLevelNodes.forEach(n => n.accept(this))

    // Always initialize a dummy variable objective unless there are no top-level nodes.
    // Could set a flag when variables are used but probably not worth it.
    if (node.topLevelNodes.length) {
      this.files.with(this.naming.internalMcfunctionFilePath('load')).prepend([new Segment(
        `scoreboard objectives remove ${this.naming.variableObjectiveName()}\n` +
        `scoreboard objectives add ${this.naming.variableObjectiveName()} dummy\n`
      )])
      // Always register load tag due to needing to initialize the dummy objective.
      this.loadFunctionNames.push('load')
    }

    // Populate function tags
    if (this.loadFunctionNames.length) {
      this.files.with('data/minecraft/tags/function/load.json').write([new Segment(
        JSON.stringify({
          values: Array.from(new Set(this.loadFunctionNames)).map(name => `${this.naming.internalNamespace()}:${name}`)
        }, null, 2)
      )])
    }
    if (this.tickFunctionNames.length) {
      this.files.with('data/minecraft/tags/function/tick.json').write([new Segment(
        JSON.stringify({
          values: Array.from(new Set(this.tickFunctionNames)).map(name => `${this.naming.internalNamespace()}:${name}`)
        }, null, 2)
      )])
    }

    return []
  }

  visitFunctionTag(node: FunctionTagNode): Segment[] {
    if (node.tag === 'tick') this.tickFunctionNames.push(node.name)
    else this.loadFunctionNames.push(node.name)

    return []
  }

  visitItemStack(node: ItemStackNode): Segment[] {
    const result = compileEditorState({ compiler: 'item_stack', error: false, data: node.itemStackData }, {})
    return [new Segment(result, node)]
  }

  visitLiteralRotation(node: LiteralRotationNode): Segment[] {
    return [
      ...node.yawNode.accept(this),
      new Segment(' ', node),
      ...node.pitchNode.accept(this)
    ]
  }

  visitLiteralInt(node: LiteralIntNode): Segment[] {
    return [new Segment(`${node.value}`, node)]
  }

  visitLiteralPosition(node: LiteralPositionNode): Segment[] {
    return [
      ...node.xNode.accept(this),
      new Segment(' ', node),
      ...node.yNode.accept(this),
      new Segment(' ', node),
      ...node.zNode.accept(this)
    ]
  }

  visitLiteralRange(node: LiteralRangeNode): Segment[] {
    return [
      ...node.minNode.accept(this),
      new Segment('..', node),
      ...node.maxNode.accept(this)
    ]
  }

  visitLiteralString(node: LiteralStringNode): Segment[] {
    return [new Segment(node.value, node)]
  }

  visitProcedureParameter(node: ProcedureParameterNode): Segment[] {
    return [new Segment(`$(${node.parameterEntry.name})`, node)]
  }

  visitTargetSelector(node: TargetSelectorNode): Segment[] { // Placeholder; will switch to editor
    const res = [new Segment(node.targetCategory, node)]
    if (node.clauseNodes.length) {
      res.push(new Segment('[', node))
      for (let i = 0; i < node.clauseNodes.length; i++) {
        if (i > 0) res.push(new Segment(',', node))
        res.push(...node.clauseNodes[i].accept(this))
      }
      res.push(new Segment(']', node))
    }
    return res
  }

  visitTempVariable(node: TempVariableNode): Segment[] {
    return this.visitVariable(node)
  }

  visitVariable(node: VariableNode): Segment[] {
    return [new Segment(`${this.naming.variableName(node.variableName)} ${this.naming.variableObjectiveName()}`, node)]
  }

  visitNumber(node: NumberNode): Segment[] {
    return [new Segment(node.value.toString())]
  }
}
