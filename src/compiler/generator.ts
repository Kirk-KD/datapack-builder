import * as Blockly from 'blockly'
import { getRuntimeBlockCodeKind } from '../blocks/specs/runtimeMetadata'
import { applyExecuteContextPrefixToCode } from './executeContext'

export const mcfunctionGenerator = new Blockly.CodeGenerator('mcfunction')
mcfunctionGenerator.INDENT = ''

mcfunctionGenerator.scrub_ = function(block, code, thisOnly) {
  const codeKind = getRuntimeBlockCodeKind(block.type)
  const shouldApplyExecuteContext = codeKind === 'command'

  if (shouldApplyExecuteContext) {
    code = applyExecuteContextPrefixToCode(code)
  }

  const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
  if (nextBlock && !thisOnly) {
    return code + mcfunctionGenerator.blockToCode(nextBlock)
  }
  return code
}