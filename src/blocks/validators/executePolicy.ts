import * as Blockly from 'blockly'

const EXECUTE_ROOT_TYPE = 'execute_root'
const EXECUTE_MODIFIER_PREFIX = 'execute_mod_'
const EXECUTE_MODIFIER_STACK_INPUT = 'MODIFIER_STACK'

function isExecuteModifierBlock(block: Blockly.Block | null): block is Blockly.Block {
  return !!block && block.type.startsWith(EXECUTE_MODIFIER_PREFIX)
}

function getInputNameForConnection(block: Blockly.Block, connection: Blockly.Connection): string | null {
  for (const input of block.inputList) {
    if (input.connection === connection) return input.name
  }
  return null
}

function isExecuteModifierStackConnection(superior: Blockly.Connection): boolean {
  const superiorBlock = superior.getSourceBlock()
  if (superiorBlock.type !== EXECUTE_ROOT_TYPE) return false

  return getInputNameForConnection(superiorBlock, superior) === EXECUTE_MODIFIER_STACK_INPUT
}

export function shouldDisallowExecuteConnection(
  superior: Blockly.Connection,
  superiorBlock: Blockly.Block,
  inferiorBlock: Blockly.Block,
): boolean {
  const superiorIsModifier = isExecuteModifierBlock(superiorBlock)
  const inferiorIsModifier = isExecuteModifierBlock(inferiorBlock)

  if (!superiorIsModifier && !inferiorIsModifier) {
    // Also enforce that MODIFIER_STACK only accepts execute modifier blocks.
    return isExecuteModifierStackConnection(superior)
  }

  if (superiorIsModifier) {
    // execute modifiers can only chain to other execute modifiers.
    return !inferiorIsModifier
  }

  return !isExecuteModifierStackConnection(superior)
}
