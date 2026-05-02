import {
  DatapackNode, ExecuteNode, IfNode, type IrVisitor, ItemStackNode, LiteralAngleNode, LiteralIntNode,
  LiteralPositionNode, LiteralRangeNode, LiteralStringNode, OnLoadNode, OnTickNode,
  ProcedureCallArgumentNode, ProcedureCallNode, ProcedureDefinitionNode, ProcedureParameterNode, SegmentNode,
  TargetSelectorNode, VariableCompareNode, VariableMatchesNode, VariableNode, VariableOperationNode, WhileNode
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
    const bodyString = node.bodyNodes.map(bodyNode => bodyNode.accept(this)).join('\n')
    const bodyFunctionId = this.naming.nextId('execute')
    this.files.with(this.naming.internalMcfunctionFilePath(bodyFunctionId)).write(bodyString + '\n')

    if (node.clauseNodes.length) {
      const clauseString = node.clauseNodes.map(clauseNode => clauseNode.accept(this)).join(' ')
      return `execute ${clauseString} run function ${this.naming.internalNamespace()}:${bodyFunctionId}`
    } else {
      return `run function ${this.naming.internalNamespace()}:${bodyFunctionId}`
    }
  }

  visitIf(node: IfNode): string {
    if (!node.trueBodyNodes.length && !node.falseBodyNodes.length) return ''

    let res = ''

    if (node.trueBodyNodes.length) {
      const id = this.naming.nextId('if_true')
      const code = node.trueBodyNodes.map(n => n.accept(this)).join('\n') + '\n'
      this.files.with(this.naming.internalMcfunctionFilePath(id)).write(code)

      const conditionCode = node.conditionNode.accept(this)
      res += `execute if ${conditionCode} run function ${this.naming.internalNamespace()}:${id}`
    }

    if (node.falseBodyNodes.length) {
      const id = this.naming.nextId('if_false')
      const code = node.falseBodyNodes.map(n => n.accept(this)).join('\n') + '\n'
      this.files.with(this.naming.internalMcfunctionFilePath(id)).write(code)

      const conditionCode = node.conditionNode.accept(this)
      res += `execute unless ${conditionCode} run function ${this.naming.internalNamespace()}:${id}`
    }

    return res
  }

  visitItemStack(node: ItemStackNode): string {
    return compileEditorState({ compiler: 'item_stack', error: false, data: node.itemStackData }, {})
  }

  visitLiteralAngle(node: LiteralAngleNode): string {
    return `${node.yaw} ${node.pitch}`
  }

  visitLiteralInt(node: LiteralIntNode): string {
    return `${node.value}`
  }

  visitLiteralPosition(node: LiteralPositionNode): string {
    return `${node.x} ${node.y} ${node.z}`
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

    const bodyCode = node.bodyNodes.map(bodyNode => bodyNode.accept(this)).join('\n')
    this.files.with(this.naming.internalMcfunctionFilePath('load')).append(bodyCode + '\n')

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

    const bodyCode = node.bodyNodes.map(bodyNode => bodyNode.accept(this)).join('\n')
    this.files.with(this.naming.internalMcfunctionFilePath('tick')).append(bodyCode + '\n')

    return ''
  }

  visitProcedureCall(node: ProcedureCallNode): string {
    return undefined
  }

  visitProcedureCallArgument(node: ProcedureCallArgumentNode): string {
    return undefined
  }

  visitProcedureDefinition(node: ProcedureDefinitionNode): string {
    return undefined
  }

  visitProcedureParameter(node: ProcedureParameterNode): string {
    return undefined
  }

  visitSegment(node: SegmentNode): string {
    const res = node.parts.map(
      part => (typeof part === 'string') ? part : part.accept(this)).join(' ')
    console.assert(res.indexOf('\n') === -1) // TODO better design
    return res
  }

  visitTargetSelector(node: TargetSelectorNode): string {
    return undefined
  }

  visitVariable(node: VariableNode): string {
    return this.naming.variableName(node.variableEntry.name)  // consider using ID in the future?
  }

  visitVariableCompare(node: VariableCompareNode): string {
    return undefined // TODO this requires a lowering pass before running the emitter.
  }

  visitVariableMatches(node: VariableMatchesNode): string {
    return `score ${node.variableNode.accept(this)} ${this.naming.variableObjectiveName()} matches ${node.rangeNode.accept(this)}`
  }

  visitVariableOperation(node: VariableOperationNode): string {
    return undefined
  }

  visitWhile(node: WhileNode): string {
    return undefined
  }
}