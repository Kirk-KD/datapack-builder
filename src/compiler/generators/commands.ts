import { mcfunctionGenerator } from "../generator"

mcfunctionGenerator.forBlock['mc_say'] = function(block) {
  const msg = mcfunctionGenerator.valueToCode(block, 'MESSAGE', 0)
  return `say ${msg}\n`
}