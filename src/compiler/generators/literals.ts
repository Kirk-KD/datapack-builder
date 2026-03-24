import { mcfunctionGenerator } from '../generator'

mcfunctionGenerator.forBlock['mc_int'] = function(block) {
  return [block.getFieldValue('VALUE'), 0]
  // TODO: compile chainable blocks
}