import { mcfunctionGenerator } from "../generator"
import { literalChain } from "../util"

mcfunctionGenerator.forBlock['mc_say'] = function(block) {
  const msgBlock = block.getInputTargetBlock('MESSAGE')!
  const [msg, hasMacro] = literalChain(msgBlock)
  return (hasMacro ? '$' : '') + `say ${msg}\n`
}

mcfunctionGenerator.forBlock['mc_teleport'] = function(block) {
  const selector = block.getFieldValue('SELECTOR')
  const x = block.getFieldValue('X')
  const y = block.getFieldValue('Y')
  const z = block.getFieldValue('Z')
  return `teleport ${selector} ${x} ${y} ${z}\n`
}