import * as Blockly from 'blockly'
import { getBlockTypesByTag } from '../specs/registry'

const chainableBlocks = getBlockTypesByTag('chainable')
const trimChainTailBlocks = getBlockTypesByTag('trimChainTail')

export function isChainableBlock(block: Blockly.Block | null): block is Blockly.Block {
  if (!block) return false
  return chainableBlocks.includes(block.type)
}

export function isTrimChainTailParent(block: Blockly.Block | null): block is Blockly.Block {
  if (!block) return false
  return trimChainTailBlocks.includes(block.type)
}

export function shouldDisallowChainConnection(
  superiorBlock: Blockly.Block,
  inferiorBlock: Blockly.Block,
): boolean {
  if (!isChainableBlock(superiorBlock) || !isChainableBlock(inferiorBlock)) {
    return false
  }

  return isTrimChainTailParent(superiorBlock.getParent())
}

export function shouldTrimChainTail(block: Blockly.Block): boolean {
  if (!isChainableBlock(block)) return false

  const parent = block.getParent()
  if (!isTrimChainTailParent(parent)) return false

  return parent.getInputTargetBlock('VALUE') === block
}
