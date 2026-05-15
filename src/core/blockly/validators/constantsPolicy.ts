import * as Blockly from 'blockly'

const CONSTANTS_ROOT_TYPE = 'constants'
const CONSTANT_DEF_TYPE = 'constant_def'
const CONSTANTS_DEFINITIONS_STACK_INPUT = 'DEFINITIONS'

function isConstantDefBlock(block: Blockly.Block | null): block is Blockly.Block {
  return !!block && block.type === CONSTANT_DEF_TYPE
}

function getInputNameForConnection(block: Blockly.Block, connection: Blockly.Connection): string | null {
  for (const input of block.inputList) {
    if (input.connection === connection) return input.name
  }
  return null
}

function isConstantsDefinitionsStackConnection(superior: Blockly.Connection): boolean {
  const superiorBlock = superior.getSourceBlock()
  if (superiorBlock.type !== CONSTANTS_ROOT_TYPE) return false

  return getInputNameForConnection(superiorBlock, superior) === CONSTANTS_DEFINITIONS_STACK_INPUT
}

function isConstantDefNextConnection(connection: Blockly.Connection): boolean {
  const block = connection.getSourceBlock()
  return isConstantDefBlock(block) && connection === block.nextConnection
}

export function shouldDisallowConstantsConnection(
  superior: Blockly.Connection,
  _superiorBlock: Blockly.Block,
  inferiorBlock: Blockly.Block,
): boolean {
  const inferiorIsConstantDef = isConstantDefBlock(inferiorBlock)
  const isConstantDefChainConnection =
    isConstantsDefinitionsStackConnection(superior) || isConstantDefNextConnection(superior)

  if (isConstantDefChainConnection) {
    return !inferiorIsConstantDef
  }

  if (inferiorIsConstantDef) {
    return true
  }

  return false
}
