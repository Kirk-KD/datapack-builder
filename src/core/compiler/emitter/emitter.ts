import {
  DatapackNode, ExecuteNode, IfNode, type IrVisitor, ItemStackNode, LiteralRotationNode, LiteralIntNode,
  LiteralPositionNode, LiteralRangeNode, LiteralStringNode, OnLoadNode, OnTickNode,
  ProcedureCallArgumentNode, ProcedureCallNode, ProcedureDefinitionNode, ProcedureParameterNode,
  TargetSelectorNode, VariableCompareNode, VariableMatchesNode, VariableNode, VariableOperationNode, WhileNode,
  CommandCompositeNode,
  FragmentCompositeNode, TempVariableNode, VariableSetNode, FunctionDefinitionNode, FunctionCallNode, IrNode
} from '../ir'
import {OutputFiles} from '../outputFiles.ts'
import {Naming} from './naming.ts'
import type {ProjectConfig} from '../../../stores'
import {compileEditorState} from './emitEditorState.ts'

export class Emitter implements IrVisitor<string> {
  readonly files: OutputFiles
  readonly naming: Naming
  readonly projectConfig: ProjectConfig

  constructor(outputFiles: OutputFiles, projectConfig: ProjectConfig) {
    this.files = outputFiles
    this.projectConfig = projectConfig
    this.naming = new Naming(this.projectConfig)
  }

  private disallow(node: IrNode): never {
    throw new Error(`Emitter should not encounter: ${node.constructor.name}`)
  }

  visitCommandComposite(node: CommandCompositeNode): string {
    const res = node.parts.map(
      part => (typeof part === 'string') ? part : part.accept(this)).join(' ')
    console.assert(res.indexOf('\n') === -1)
    return res + '\n'
  }

  visitFragmentComposite(node: FragmentCompositeNode): string {
    const res = node.parts.map(
      part => (typeof part === 'string') ? part : part.accept(this)).join(' ')
    console.assert(res.indexOf('\n') === -1)
    return res
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): string {
    this.files.with(this.naming.internalMcfunctionFilePath(node.name)).write(
      node.bodyNodes.map(n => n.accept(this)).join('')
    )
    return ''
  }

  visitFunctionCall(node: FunctionCallNode): string {
    return `function ${this.naming.internalNamespace()}:${node.name}`
  }

  visitDatapack(node: DatapackNode): string {
    this.files.with('pack.mcmeta').write(
      JSON.stringify({
        pack: {
          pack_format: this.projectConfig.packFormat,
          description: this.projectConfig.description
        }
      }, null, 2)
    )

    node.topLevelNodes.forEach(n => n.accept(this))

    return ''
  }

  visitExecute(node: ExecuteNode): string {
    this.disallow(node)
  }

  visitIf(node: IfNode): string {
    this.disallow(node)
  }

  visitItemStack(node: ItemStackNode): string {
    return compileEditorState({ compiler: 'item_stack', error: false, data: node.itemStackData }, {})
  }

  visitLiteralRotation(node: LiteralRotationNode): string {
    return `${node.yawNode.accept(this)} ${node.pitchNode.accept(this)}`
  }

  visitLiteralInt(node: LiteralIntNode): string {
    return `${node.value}`
  }

  visitLiteralPosition(node: LiteralPositionNode): string {
    return `${node.xNode.accept(this)} ${node.yNode.accept(this)} ${node.zNode.accept(this)}`
  }

  visitLiteralRange(node: LiteralRangeNode): string {
    return `${node.minNode.accept(this)}..${node.maxNode.accept(this)}`
  }

  visitLiteralString(node: LiteralStringNode): string {
    return node.value
  }

  visitOnLoad(node: OnLoadNode): string {
    this.files.with(this.naming.internalMcfunctionFilePath('load')).prepend(
      `scoreboard objectives add ${this.naming.variableObjectiveName()} dummy\n`
      + `scoreboard players set ${this.naming.initializedFlagName()} ${this.naming.variableObjectiveName()} 1\n`
    )
    this.files.with('data/minecraft/tags/function/load.json').write(
      JSON.stringify({
        value: [`${this.naming.internalNamespace()}:load`]
      }, null, 2)
    )

    const bodyCode = node.bodyNodes.map(bodyNode => bodyNode.accept(this)).join('')
    this.files.with(this.naming.internalMcfunctionFilePath('load')).append(bodyCode)

    return ''
  }

  visitOnTick(node: OnTickNode): string {
    this.files.with(this.naming.internalMcfunctionFilePath('tick')).prepend(
      `execute unless score ${this.naming.initializedFlagName()} ${this.naming.variableObjectiveName()} matches 1 run return fail\n`
    )
    this.files.with('data/minecraft/tags/function/tick.json').write(
      JSON.stringify({
        value: [`${this.naming.internalNamespace()}:tick`]
      }, null, 2)
    )

    const bodyCode = node.bodyNodes.map(bodyNode => bodyNode.accept(this)).join('')
    this.files.with(this.naming.internalMcfunctionFilePath('tick')).append(bodyCode)

    return ''
  }

  visitProcedureCall(node: ProcedureCallNode): string {
    this.disallow(node)
  }

  visitProcedureCallArgument(node: ProcedureCallArgumentNode): string {
    return undefined // TODO pending lowering pass
  }

  visitProcedureDefinition(node: ProcedureDefinitionNode): string {
    this.disallow(node)
  }

  visitProcedureParameter(node: ProcedureParameterNode): string {
    return `$(${node.parameterEntry.name})`
  }

  visitTargetSelector(node: TargetSelectorNode): string { // Placeholder; will switch to editor
    let res = node.targetCategory
    if (node.clauseNodes.length) res += `[${node.clauseNodes.map(n => n.accept(this)).join(',')}]`
    return res
  }

  visitTempVariable(node: TempVariableNode): string {
    return this.visitVariable(node)
  }

  visitVariable(node: VariableNode): string {
    return `${this.naming.variableName(node.variableName)} ${this.naming.variableObjectiveName()}`
  }

  visitVariableCompare(node: VariableCompareNode): string {
    this.disallow(node)
  }

  visitVariableMatches(node: VariableMatchesNode): string {
    this.disallow(node)
  }

  visitVariableSet(node: VariableSetNode): string {
    this.disallow(node)
  }

  visitVariableOperation(node: VariableOperationNode): string {
    this.disallow(node)
  }

  visitWhile(node: WhileNode): string {
    this.disallow(node)
  }
}
