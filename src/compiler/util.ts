import * as Blockly from 'blockly'
import { getParameterNameById } from './workspaceRegistry'
import { compileSelector } from '../blocks/specs/selectors'

export function literalChain(block: Blockly.Block): [string, boolean] {
  let value: string
  let hasMacro = false

  // Is macro reference
  if (block.type === 'mc_param') {
    const paramValue = block.getFieldValue('PARAM_NAME') as string
    const paramName = getParameterNameById(paramValue) ?? paramValue
    value = `$(${paramName})`
    hasMacro = true
  }
  else if (block.type === 'mc_target_selector') {
    value = compileSelector(block)
  }
  else {
    value = block.getFieldValue('VALUE') as string
  }
  
  // Check next in chain
  const nextBlock = block.getInputTargetBlock('CHAIN_NEXT')
  const [nextStr, nextHasMacro] = nextBlock ? literalChain(nextBlock) : ['', false]
  
  return [value + nextStr, hasMacro || nextHasMacro]
}

export function snbtToString(snbt: Record<string, string>): string {
  const entries = Object.entries(snbt).map(([key, value]) => `${key}:"${value}"`)
  return `{${entries.join(',')}}`
}
