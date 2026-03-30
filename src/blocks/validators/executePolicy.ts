import * as Blockly from 'blockly'

const EXECUTE_ROOT_TYPE = 'execute_root'
const EXECUTE_MODIFIER_PREFIX = 'execute_mod_'
const EXECUTE_CONDITION_TYPE = 'execute_condition'
const EXECUTE_MODIFIER_STACK_INPUT = 'MODIFIER_STACK'

function isExecuteModifierBlock(block: Blockly.Block | null): block is Blockly.Block {
  return !!block && (
    block.type.startsWith(EXECUTE_MODIFIER_PREFIX)
    || block.type === EXECUTE_CONDITION_TYPE
  )
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

function isExecuteModifierNextConnection(connection: Blockly.Connection): boolean {
  const block = connection.getSourceBlock()
  return isExecuteModifierBlock(block) && connection === block.nextConnection
}

export function shouldDisallowExecuteConnection(
  superior: Blockly.Connection,
  _superiorBlock: Blockly.Block,
  inferiorBlock: Blockly.Block,
): boolean {
  const inferiorIsModifier = isExecuteModifierBlock(inferiorBlock)
  const isModifierChainConnection =
    isExecuteModifierStackConnection(superior) || isExecuteModifierNextConnection(superior)

  if (isModifierChainConnection) {
    // execute modifier stacks/chains only accept execute modifier blocks.
    return !inferiorIsModifier
  }

  if (inferiorIsModifier) {
    // execute modifiers cannot connect into any other kind of stack.
    return true
  }

  // Value inputs on execute modifier blocks should use normal Blockly type checks.
  return false
}
