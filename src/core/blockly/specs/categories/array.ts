import type {BlockSpec} from '../types.ts'
import type {ConstantValueType} from '../../registry'
import {bindExtraState, mutateExtraState, type StatefulBlock} from '../extraState.ts'
import {createStateDropdown} from '../dynamicFields.ts'
import {valueTypes} from '../valueTypes.ts'
import * as Blockly from 'blockly'
import {colours} from '../../colours.ts'
import {TextButton} from '../../fields/textButton.ts'

type ArrayBlockState = {
  type_: ConstantValueType
}
type ArrayBlock = StatefulBlock & ArrayBlockState

type ArrayItemBlockState = {
  parentId_: string | null
  type_: ConstantValueType
}
type ArrayItemBlock = StatefulBlock & ArrayItemBlockState

const ARRAY_ITEM_BLOCK_TYPE = 'array_item'
const ARRAY_ITEMS_INPUT = 'ITEMS'
const ARRAY_ITEM_VALUE_INPUT = 'VALUE'

const constantValueTypeOptions: [string, ConstantValueType][] = [
  ['integers', 'int'],
  ['strings', 'string'],
  ['positions', 'position'],
  ['item stacks', 'item_stack'],
]

const constantValueTypeChecks: Record<ConstantValueType, string> = {
  int: valueTypes.Int,
  string: valueTypes.String,
  position: valueTypes.Position,
  item_stack: valueTypes.ItemStack,
}

function getConstantValueTypeCheck(valueType: ConstantValueType) {
  return constantValueTypeChecks[valueType]
}

function getLastStackBlock(firstBlock: Blockly.Block) {
  let current = firstBlock
  while (current.getNextBlock()) {
    current = current.getNextBlock() as Blockly.Block
  }
  return current
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

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    void block
    throw Error() // TODO stub
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
        .appendField('item')
    }

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    void block
    throw Error() // TODO stub
  }
}

export const arrayBlockSpecs: BlockSpec[] = [
  arrayBlockSpec,
  arrayItemBlockSpec,
]
