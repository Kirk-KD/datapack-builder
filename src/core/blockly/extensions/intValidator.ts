import * as Blockly from 'blockly'
import { validateInt } from '../validators'

Blockly.Extensions.register('mc_int_validator', function(this: Blockly.Block) {
  this.getField('VALUE')!.setValidator(validateInt)
})
