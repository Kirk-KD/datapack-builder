import * as Blockly from 'blockly'
import {generateDatapackIr} from './generator'
import {Emitter} from './emitter'
import {LoweringPass} from './passes'
import {OutputFiles} from './outputFiles.ts'
import type {ProjectConfig} from '../../stores'
import {IrNode} from './ir'

export function orchestrate(workspace: Blockly.WorkspaceSvg, projectConfig: ProjectConfig): OutputFiles {
  const datapackIr = generateDatapackIr(workspace)
  // console.log(debugIr(datapackIr))

  // Passes
  const loweredIr = new LoweringPass(projectConfig).run(datapackIr)
  console.log(debugIr(loweredIr))

  // Emission
  const outputFiles = new OutputFiles()
  const emitter = new Emitter(outputFiles, projectConfig)
  emitter.visitDatapack(loweredIr)

  return outputFiles
}

// Temporary debug
function debugIr(node: IrNode, indent: number = 0): string {
  const pad = '  '.repeat(indent)
  const lines: string[] = [`${pad}${node.constructor.name}(`]

  for (const [key, value] of Object.entries(node)) {
    if (key === 'sourceBlockId') continue  // noise, skip

    if (value instanceof IrNode) {
      lines.push(`${pad}  ${key}:`)
      lines.push(debugIr(value, indent + 2))

    } else if (Array.isArray(value) && value.every(v => v instanceof IrNode)) {
      lines.push(`${pad}  ${key}: [`)
      for (const item of value) {
        lines.push(debugIr(item, indent + 2))
      }
      lines.push(`${pad}  ]`)

    } else if (Array.isArray(value) && value.some(v => v instanceof IrNode)) {
      // mixed array e.g. (FragmentNode | string)[]
      lines.push(`${pad}  ${key}: [`)
      for (const item of value) {
        if (item instanceof IrNode) {
          lines.push(debugIr(item, indent + 2))
        } else {
          lines.push(`${'  '.repeat(indent + 2)}"${item}"`)
        }
      }
      lines.push(`${pad}  ]`)

    } else if (typeof value === 'string') {
      lines.push(`${pad}  ${key}: "${value}"`)

    } else if (value !== null && value !== undefined) {
      lines.push(`${pad}  ${key}: ${JSON.stringify(value)}`)
    }
  }

  lines.push(`${pad})`)

  return lines.join('\n')
}
