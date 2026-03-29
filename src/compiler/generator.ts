import * as Blockly from 'blockly'

export const mcfunctionGenerator = new Blockly.CodeGenerator('mcfunction')
mcfunctionGenerator.INDENT = ''

mcfunctionGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
  if (nextBlock && !thisOnly) {
    return code + mcfunctionGenerator.blockToCode(nextBlock)
  }
  return code
}
