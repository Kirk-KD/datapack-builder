import * as Blockly from 'blockly'

export function literalChain(block: Blockly.Block): [string, boolean] {
  // Is macro reference
  if (block.type === 'mc_param') {
    const paramName = block.getFieldValue('PARAM_NAME') as string
    const nextBlock = block.getInputTargetBlock('CHAIN_NEXT')
    const [nextStr, _] = nextBlock ? literalChain(nextBlock) : ['', false]
    return [`$(${paramName})` + nextStr, true]
  }
  
  // Not macro, check next in chain for macro
  const value = block.getFieldValue('VALUE') as string
  const nextBlock = block.getInputTargetBlock('CHAIN_NEXT')
  const [nextStr, nextHasMacro] = nextBlock ? literalChain(nextBlock) : ['', false]
  return [value + nextStr, nextHasMacro]
}