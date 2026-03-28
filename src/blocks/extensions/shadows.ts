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

const shadows: Record<string, ShadowBlock> = {
  stringLiteral: {
    type: 'mc_string',
    fields: {
      VALUE: 'Hello world',
    },
  },
  targetSelectorString: {
    type: 'mc_string',
    fields: {
      VALUE: '@s'
    }
  }
}

Blockly.Extensions.register('mc_say_shadows', function(this: Blockly.Block) {
  setShadowState(this, 'MESSAGE', shadows.stringLiteral)
})

Blockly.Extensions.register('execute_mod_as_shadow', function(this: Blockly.Block) {
  setShadowState(this, 'TARGET', shadows.targetSelectorString)
})
