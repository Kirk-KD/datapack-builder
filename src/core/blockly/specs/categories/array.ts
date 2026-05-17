import type {BlockSpec} from '../types.ts'
import type {ConstantValueType} from '../../registry'
import {bindExtraState, mutateExtraState, type StatefulBlock} from '../extraState.ts'
import {createStateDropdown} from '../dynamicFields.ts'
import {valueTypes} from '../valueTypes.ts'
import * as Blockly from 'blockly'
import {colours} from '../../colours.ts'
import {TextButton} from '../../fields/textButton.ts'
import {ArrayNode, ItemAtIndexNode, statementToIr, valueToIr} from '../../../compiler'
import {setShadowState} from '../../extensions/shadows.ts'

type ArrayElementValueType = Exclude<ConstantValueType, 'array'>

type ArrayBlockState = {
  type_: ArrayElementValueType
}
type ArrayBlock = StatefulBlock & ArrayBlockState

type ArrayItemBlockState = {
  parentId_: string | null
  type_: ArrayElementValueType
}
type ArrayItemBlock = StatefulBlock & ArrayItemBlockState

const ARRAY_ITEM_BLOCK_TYPE = 'array_item'
const ARRAY_ITEMS_INPUT = 'ITEMS'
const ARRAY_ITEM_VALUE_INPUT = 'VALUE'
const ARRAY_ITEM_INDEX_FIELD = 'INDEX'
const ITEM_AT_INDEX_BLOCK_TYPE = 'item_at_index'
const ITEM_AT_INDEX_INDEX_INPUT = 'INDEX'
const ITEM_AT_INDEX_ARRAY_INPUT = 'ARRAY'

const constantValueTypeOptions: [string, ArrayElementValueType][] = [
  ['integers', 'int'],
  ['strings', 'string'],
  ['positions', 'position'],
  ['item stacks', 'item_stack'],
]

const constantValueTypeChecks: Record<ArrayElementValueType, string> = {
  int: valueTypes.Int,
  string: valueTypes.String,
  position: valueTypes.Position,
  item_stack: valueTypes.ItemStack,
}

function getConstantValueTypeCheck(valueType: ArrayElementValueType) {
  return constantValueTypeChecks[valueType]
}

function getArrayElementTypeCheck(block: Blockly.Block) {
  const targetBlock = block.getInputTargetBlock(ITEM_AT_INDEX_ARRAY_INPUT)
  if (targetBlock?.type === valueTypes.Array) {
    return getConstantValueTypeCheck((targetBlock as ArrayBlock).type_)
  }

  return Object.values(constantValueTypeChecks)
}

function updateArrayGetByIndexOutputType(block: Blockly.Block) {
  block.setOutput(true, getArrayElementTypeCheck(block))
}

function getLastStackBlock(firstBlock: Blockly.Block) {
  let current = firstBlock
  while (current.getNextBlock()) {
    current = current.getNextBlock() as Blockly.Block
  }
  return current
}

function getArrayItemIndex(arrayItemBlock: ArrayItemBlock) {
  if (!arrayItemBlock.parentId_) return null

  const parentBlock = arrayItemBlock.workspace.getBlockById(arrayItemBlock.parentId_)
  if (!parentBlock || parentBlock.type !== valueTypes.Array) return null

  let currentBlock = parentBlock.getInput(ARRAY_ITEMS_INPUT)?.connection?.targetBlock() ?? null
  let index = 0

  while (currentBlock) {
    if (currentBlock.id === arrayItemBlock.id) return index
    currentBlock = currentBlock.getNextBlock()
    index += 1
  }

  return null
}

function getArrayItemLabel(arrayItemBlock: ArrayItemBlock) {
  const index = getArrayItemIndex(arrayItemBlock)
  return index === null ? 'item' : `${index}.`
}

function updateArrayItemLabel(arrayItemBlock: ArrayItemBlock) {
  const labelField = arrayItemBlock.getField(ARRAY_ITEM_INDEX_FIELD)
  if (labelField) {
    labelField.setValue(getArrayItemLabel(arrayItemBlock))
  }
}

function updateArrayItemType(arrayItemBlock: ArrayItemBlock, valueType: ArrayElementValueType) {
  mutateExtraState(arrayItemBlock, () => {
    arrayItemBlock.type_ = valueType
  })

  arrayItemBlock.getInput(ARRAY_ITEM_VALUE_INPUT)
    ?.setCheck(getConstantValueTypeCheck(arrayItemBlock.type_))
}

function updateArrayItemsFromParent(arrayBlock: ArrayBlock) {
  let currentBlock = arrayBlock.getInput(ARRAY_ITEMS_INPUT)?.connection?.targetBlock() ?? null

  while (currentBlock) {
    if (currentBlock.type === ARRAY_ITEM_BLOCK_TYPE) {
      const arrayItemBlock = currentBlock as ArrayItemBlock
      updateArrayItemLabel(arrayItemBlock)
      updateArrayItemType(arrayItemBlock, arrayBlock.type_)
    }
    currentBlock = currentBlock.getNextBlock()
  }
}

function connectArrayItemBlock(arrayBlock: ArrayBlock, arrayItemBlock: ArrayItemBlock) {
  const itemsConnection = arrayBlock.getInput(ARRAY_ITEMS_INPUT)?.connection
  if (!itemsConnection || !arrayItemBlock.previousConnection) return

  const firstItemBlock = itemsConnection.targetBlock()
  if (!firstItemBlock) {
    itemsConnection.connect(arrayItemBlock.previousConnection)
    return
  }

  const lastItemBlock = getLastStackBlock(firstItemBlock)
  if (lastItemBlock.nextConnection) {
    lastItemBlock.nextConnection.connect(arrayItemBlock.previousConnection)
  }
}

function createArrayItemBlock(arrayBlock: ArrayBlock) {
  if (arrayBlock.isInFlyout) return

  const arrayItemBlock = arrayBlock.workspace.newBlock(ARRAY_ITEM_BLOCK_TYPE) as ArrayItemBlock

  mutateExtraState(arrayItemBlock, () => {
    arrayItemBlock.parentId_ = arrayBlock.id
    arrayItemBlock.type_ = arrayBlock.type_
  })
  arrayItemBlock.updateShape_?.()
  arrayItemBlock.initSvg()
  arrayItemBlock.render()

  connectArrayItemBlock(arrayBlock, arrayItemBlock)
  updateArrayItemsFromParent(arrayBlock)
}

const arrayBlockSpec: BlockSpec = {
  type: valueTypes.Array,
  category: 'array',
  init(this: Blockly.Block) {
    const block = this as ArrayBlock
    bindExtraState<ArrayBlock, ArrayBlockState>(block, {
      type_: 'int',
    })

    block.setColour(colours.array)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setInputsInline(true)
    block.setOutput(true, valueTypes.Array)

    block.updateShape_ = function(this: ArrayBlock) {
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      this.appendDummyInput('TOP')
        .appendField('array of ')
        .appendField(createStateDropdown(this, 'type_', constantValueTypeOptions), 'TYPE')
        .appendField(new TextButton('add', () => createArrayItemBlock(this)))

      this.appendStatementInput(ARRAY_ITEMS_INPUT)
        .setCheck(ARRAY_ITEM_BLOCK_TYPE)
    }

    block.onchange = function(this: ArrayBlock) {
      updateArrayItemsFromParent(this)
    }

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    return new ArrayNode(statementToIr(block, ARRAY_ITEMS_INPUT), block.id)
  }
}

const arrayItemBlockSpec: BlockSpec = {
  type: ARRAY_ITEM_BLOCK_TYPE,
  init(this: Blockly.Block) {
    const block = this as ArrayItemBlock
    bindExtraState<ArrayItemBlock, ArrayItemBlockState>(block, {
      parentId_: null,
      type_: 'int',
    })

    block.setColour(colours.array)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setInputsInline(true)
    block.setPreviousStatement(true, ARRAY_ITEM_BLOCK_TYPE)
    block.setNextStatement(true, ARRAY_ITEM_BLOCK_TYPE)

    block.updateShape_ = function(this: ArrayItemBlock) {
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      this.appendValueInput(ARRAY_ITEM_VALUE_INPUT)
        .setCheck(getConstantValueTypeCheck(this.type_))
        .appendField(getArrayItemLabel(this), ARRAY_ITEM_INDEX_FIELD)
    }

    block.onchange = function(this: ArrayItemBlock) {
      updateArrayItemLabel(this)
    }

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    return valueToIr(block, ARRAY_ITEM_VALUE_INPUT)
  }
}

const itemAtIndexBlockSpec: BlockSpec = {
  type: ITEM_AT_INDEX_BLOCK_TYPE,
  category: 'array',
  init(this: Blockly.Block) {
    this.setColour(colours.array)
    this.setTooltip('')
    this.setHelpUrl('')
    this.setInputsInline(true)

    this.appendValueInput(ITEM_AT_INDEX_INDEX_INPUT)
      .setCheck(valueTypes.Int)
      .appendField('item at index')

    this.appendValueInput(ITEM_AT_INDEX_ARRAY_INPUT)
      .setCheck(valueTypes.Array)
      .appendField('of')

    updateArrayGetByIndexOutputType(this)
    this.setOnChange(function(this: Blockly.Block) {
      updateArrayGetByIndexOutputType(this)
    })
  },
  generator(block: Blockly.Block) {
    return new ItemAtIndexNode(
      valueToIr(block, ITEM_AT_INDEX_ARRAY_INPUT),
      valueToIr(block, ITEM_AT_INDEX_INDEX_INPUT),
      block.id
    )
  },
  setShadowBlocks(this: Blockly.Block) {
    setShadowState(this, ITEM_AT_INDEX_INDEX_INPUT, { type: valueTypes.Int })
  }
}

export const arrayBlockSpecs: BlockSpec[] = [
  arrayBlockSpec,
  arrayItemBlockSpec,
  itemAtIndexBlockSpec,
]
