import { mcfunctionGenerator } from "../generator"

mcfunctionGenerator.forBlock['mc_say'] = function(block) {
  const msg = block.getFieldValue('MESSAGE')
  return `say ${msg}\n`
}