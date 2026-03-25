import { mcfunctionGenerator } from "../generator"
import { literalChain } from "../util"

mcfunctionGenerator.forBlock['mc_say'] = function(block) {
  const msgBlock = block.getInputTargetBlock('MESSAGE')!
  const [msg, hasMacro] = literalChain(msgBlock)
  return (hasMacro ? '$' : '') + `say ${msg}\n`
}