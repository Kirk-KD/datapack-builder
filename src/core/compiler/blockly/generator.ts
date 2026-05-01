import * as Blockly from 'blockly'

export const mcfunctionGenerator = new Blockly.CodeGenerator('mcfunction')
mcfunctionGenerator.INDENT = ''

mcfunctionGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock()

  let processedCode
  if (nextBlock && !thisOnly) {
    processedCode = code + mcfunctionGenerator.blockToCode(nextBlock)
  } else {
    processedCode = code
  }

  // TODO append '$' before lines using procedure parameters

  return processedCode
}