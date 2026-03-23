import * as Blockly from 'blockly'

export const mcfunctionGenerator = new Blockly.CodeGenerator('mcfunction')
mcfunctionGenerator.INDENT = ''

// scrub enables compiling next block
mcfunctionGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
  if (nextBlock && !thisOnly) {
    return code + mcfunctionGenerator.blockToCode(nextBlock)
  }
  return code
}

mcfunctionGenerator.forBlock['math_number'] = function(block) {
  return [block.getFieldValue('NUM'), 0]
}