import * as Blockly from 'blockly'
import {DatapackNode, type IrGeneratorFunction, IrNode, type TopLevelNode} from '../ir'
import type {BlockSpec} from '../../blockly/specs/types.ts'

const irGenerators = new Map<string /* block type */, IrGeneratorFunction>()

export function registerBlockIrGenerator(blockSpec: BlockSpec) {
  irGenerators.set(blockSpec.type, blockSpec.generator)
}

export function valueToIr<T extends IrNode>(block: Blockly.Block, name: string): T {
  // TODO better error handling
  const connectedBlock = block.getInputTargetBlock(name)!
  return blockToIr(connectedBlock)
}

export function blockToIr<T extends IrNode>(block: Blockly.Block): T {
  return irGenerators.get(block.type)!(block) as T
}

/**
 * Continuously generate a list of IR nodes, starting from the *next* block connected after `block`.
 * `block` itself is not parsed.
 * @param block The block before the chain of blocks to be parsed.
 */
export function nextBlocksToIr(block: Blockly.Block): IrNode[] {
  const nodes = []
  let bodyBlock = block.getNextBlock()
  while (bodyBlock) {
    nodes.push(blockToIr(bodyBlock))
    bodyBlock = bodyBlock.getNextBlock()
  }
  return nodes
}

export function statementToIr(block: Blockly.Block, name: string): IrNode[] {
  const first = block.getInputTargetBlock(name)!
  return [blockToIr(first), ...nextBlocksToIr(block.getInputTargetBlock(name)!)]
}

export function generateDatapackIr(workspace: Blockly.WorkspaceSvg) {
  const topLevelBlocks = workspace.getTopBlocks()
  return new DatapackNode(topLevelBlocks.map(block => irGenerators.get(block.type)!(block) as TopLevelNode))
}