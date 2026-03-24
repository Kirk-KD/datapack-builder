import * as Blockly from 'blockly'
import { mcfunctionGenerator } from '../generator'

function literalChain(block: Blockly.Block): string {
  const value = block.getFieldValue('VALUE') as string
  const nextBlock = block.getInputTargetBlock('CHAIN_NEXT')
  return value + (nextBlock ? literalChain(nextBlock) : '')
}

mcfunctionGenerator.forBlock['mc_int'] = function(block) {
  return [literalChain(block), 0]
}

mcfunctionGenerator.forBlock['mc_string'] = function(block) {
  return [literalChain(block), 0]
}