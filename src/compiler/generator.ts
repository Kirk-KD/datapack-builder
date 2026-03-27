import * as Blockly from 'blockly'
import { applyExecuteContextPrefixToCode } from './executeContext'

export const mcfunctionGenerator = new Blockly.CodeGenerator('mcfunction')
mcfunctionGenerator.INDENT = ''

// scrub enables compiling next block
mcfunctionGenerator.scrub_ = function(block, code, thisOnly) {
  const isValueBlock = !!block.outputConnection
  const isExecuteRoot = block.type === 'execute_root'
  const isExecuteModifier = block.type.startsWith('execute_mod_')

  // Full command lines adopt the current execute context automatically
  if (!isValueBlock && !isExecuteRoot && !isExecuteModifier) {
    code = applyExecuteContextPrefixToCode(code)
  }

  const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
  if (nextBlock && !thisOnly) {
    return code + mcfunctionGenerator.blockToCode(nextBlock)
  }
  return code
}