import * as Blockly from 'blockly'
import { getParameterNameById } from './workspaceRegistry'

export function literalChain(block: Blockly.Block): [string, boolean] {
  // Is macro reference
  if (block.type === 'mc_param') {
    const paramValue = block.getFieldValue('PARAM_NAME') as string
    const paramName = getParameterNameById(paramValue) ?? paramValue
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

export function snbtToString(snbt: Record<string, string>): string {
  const entries = Object.entries(snbt).map(([key, value]) => `${key}:"${value}"`)
  return `{${entries.join(',')}}`
}