import { mcfunctionGenerator } from '../generator'
import { literalChain } from '../util'

mcfunctionGenerator.forBlock['mc_int'] = function(block) {
  const [text, _] = literalChain(block)
  return [text, 0]
}

mcfunctionGenerator.forBlock['mc_string'] = function(block) {
  const [text, _] = literalChain(block)
  return [text, 0]
}