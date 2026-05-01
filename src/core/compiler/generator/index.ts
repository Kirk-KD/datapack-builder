import * as Blockly from 'blockly'
import {DatapackNode, type IrGenerator, type TopLevelNode} from '../ir'
// import type {BlockSpec} from '../../blockly/specs/types.ts'

const irGenerators = new Map<string /* block type */, IrGenerator>()

// export function registerGenerator(blockSpec: BlockSpec) {
//   irGenerators.set(blockSpec.type, blockSpec.generator)
// }

export function generateDatapackIr(workspace: Blockly.WorkspaceSvg) {
  const topLevelBlocks = workspace.getTopBlocks()
  return new DatapackNode(topLevelBlocks.map(block => irGenerators.get(block.type)!(block) as TopLevelNode))
}