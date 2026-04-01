import * as Blockly from 'blockly'
import {PROC_DEF_NAME} from "../blocks/specs/procedures.ts";
import type {IProcedureBlock} from "@blockly/block-shareable-procedures";

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

  // Prepend '$' to lines needing macros
  if (block.type === PROC_DEF_NAME) {
    const procBlock = block as unknown as IProcedureBlock
    const paramNames = procBlock.getProcedureModel().getParameters().map(param => param.getName())

    const lines = processedCode.split('\n')
    const processedLines = lines.map(line =>
      paramNames.some(paramName => line.includes(`$(${paramName})`)) ? '$' + line : line
    )
    return processedLines.join('\n')
  }

  return processedCode
}