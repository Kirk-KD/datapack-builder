import * as Blockly from 'blockly'

const ARRAY_TYPE = 'array'
const ARRAY_ITEM_TYPE = 'array_item'
const ARRAY_ITEMS_STACK_INPUT = 'ITEMS'

type ArrayItemBlock = Blockly.Block & {
  parentId_?: string | null
}

function isArrayItemBlock(block: Blockly.Block | null): block is ArrayItemBlock {
  return !!block && block.type === ARRAY_ITEM_TYPE
}

function getInputNameForConnection(block: Blockly.Block, connection: Blockly.Connection): string | null {
  for (const input of block.inputList) {
    if (input.connection === connection) return input.name
  }
  return null
}

function isArrayItemsStackConnection(superior: Blockly.Connection): boolean {
  const superiorBlock = superior.getSourceBlock()
  if (superiorBlock.type !== ARRAY_TYPE) return false

  return getInputNameForConnection(superiorBlock, superior) === ARRAY_ITEMS_STACK_INPUT
}

function isArrayItemNextConnection(connection: Blockly.Connection): boolean {
  const block = connection.getSourceBlock()
  return isArrayItemBlock(block) && connection === block.nextConnection
}

function canConnectToParentInput(superior: Blockly.Connection, inferiorBlock: ArrayItemBlock): boolean {
  const superiorBlock = superior.getSourceBlock()
  return isArrayItemsStackConnection(superior) && inferiorBlock.parentId_ === superiorBlock.id
}

function canConnectToSameParentItem(superior: Blockly.Connection, inferiorBlock: ArrayItemBlock): boolean {
  const superiorBlock = superior.getSourceBlock()
  return isArrayItemNextConnection(superior)
    && isArrayItemBlock(superiorBlock)
    && !!inferiorBlock.parentId_
    && inferiorBlock.parentId_ === superiorBlock.parentId_
}

export function shouldDisallowArrayConnection(
  superior: Blockly.Connection,
  _superiorBlock: Blockly.Block,
  inferiorBlock: Blockly.Block,
): boolean {
  const superiorIsArrayItemChainConnection =
    isArrayItemsStackConnection(superior) || isArrayItemNextConnection(superior)
  const inferiorIsArrayItem = isArrayItemBlock(inferiorBlock)

  if (superiorIsArrayItemChainConnection) {
    if (!inferiorIsArrayItem) return true

    return !(
      canConnectToParentInput(superior, inferiorBlock)
      || canConnectToSameParentItem(superior, inferiorBlock)
    )
  }

  if (inferiorIsArrayItem) {
    return true
  }

  return false
}
