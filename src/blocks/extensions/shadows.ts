import * as Blockly from 'blockly'
import { Block } from 'blockly'

type ShadowBlock = {
  type: string
  fields?: Record<string, unknown>
}

function setShadowState(block: Block, inputName: string, shadowBlock: ShadowBlock) {
  const connection = block.getInput(inputName)?.connection
  if (!connection || connection.targetBlock()) return
  connection.setShadowState(shadowBlock)
}

function shadowString(s: string): ShadowBlock {
  return {
    type: 'mc_string',
    fields: {
      VALUE: s
    }
  }
}
function shadowTargetSelector(): ShadowBlock {
  return {
    type: 'mc_target_selector'
  }
}
function shadowInt(n?: number): ShadowBlock {
  return {
    type: 'mc_int',
    fields: {
      VALUE: n || 0
    }
  }
}

const register = Blockly.Extensions.register

register('mc_say_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'MESSAGE', shadowString('Hello world'))
})
register('mc_teleport_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'SELECTOR', shadowTargetSelector())
})

register('execute_mod_as_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'TARGET', shadowTargetSelector())
})
register('execute_mod_at_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'TARGET', shadowString('~ ~ ~'))
})
register('execute_mod_facing_entity_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'TARGET', shadowTargetSelector())
})
register('execute_mod_positioned_as_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'TARGET', shadowTargetSelector())
})
register('execute_mod_rotated_as_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'TARGET', shadowTargetSelector())
})

register('mc_comp_score_compare_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'VAR_B', shadowInt())
})

register('mc_var_set_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'VALUE', shadowInt())
})
register('mc_var_change_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'VALUE', shadowInt(1))
})