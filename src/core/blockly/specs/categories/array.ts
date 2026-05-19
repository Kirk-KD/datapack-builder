import type {BlockSpec} from '../types.ts'
import type {ConstantValueType} from '../../registry'
import {bindExtraState, mutateExtraState, type StatefulBlock} from '../extraState.ts'
import {createStateDropdown} from '../dynamicFields.ts'
import {valueTypes} from '../valueTypes.ts'
import * as Blockly from 'blockly'
import {colours} from '../../colours.ts'
import {TextButton} from '../../fields/textButton.ts'
import {
  ArrayForItemNode,
  ArrayForNode,
  ArrayNode,
  CommandNode,
  ItemAtIndexNode,
  statementToIr,
  valueToIr
} from '../../../compiler'
import {setShadowState} from '../../extensions/shadows.ts'
import {states} from '../../states.ts'
import getToolboxContents from '../../getToolboxContents.ts'
import type {ConstantDefBlock, ConstantGetBlock} from './constants.ts'
import {CONSTANT_DEFINITION_VALUE_INPUT} from './constants.ts'

type ArrayElementValueType = Exclude<ConstantValueType, 'array'>

type ArrayBlockState = {
  type_: ArrayElementValueType
}
type ArrayBlock = StatefulBlock & ArrayBlockState

type ForEachBlockState = {
  itemName_: string
}
type ForEachBlock = StatefulBlock & ForEachBlockState

type ArrayItemBlockState = {
  parentId_: string | null
  type_: ArrayElementValueType
}
type ArrayItemBlock = StatefulBlock & ArrayItemBlockState

type ForEachItemBlockState = {
  parentId_: string | null
  itemName_: string
  itemType_: ArrayElementValueType | null
}
type ForEachItemBlock = StatefulBlock & ForEachItemBlockState

const ARRAY_ITEM_BLOCK_TYPE = 'array_item'
const ARRAY_ITEMS_INPUT = 'ITEMS'
const ARRAY_ITEM_VALUE_INPUT = 'VALUE'
const ARRAY_ITEM_INDEX_FIELD = 'INDEX'
const FOR_EACH_IN_ARRAY_BLOCK_TYPE = 'for_each_in_array'
const FOR_EACH_ITEM_NAME_FIELD = 'ITEM_NAME'
const FOR_EACH_ARRAY_INPUT = 'ARRAY'
const FOR_EACH_BODY_INPUT = 'BODY'
const FOR_EACH_ITEM_BLOCK_TYPE = 'for_each_item'
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

function getConstantDefinitionBlock(workspace: Blockly.Workspace, constantName: string) {
  return workspace.getBlocksByType(valueTypes.ConstantDef, false).find(block => {
    return (block as ConstantDefBlock).constant?.name === constantName
  }) ?? null
}

function getArrayElementTypeFromBlock(
  block: Blockly.Block | null,
  visitedBlockIds = new Set<string>(),
  visitedConstantNames = new Set<string>(),
): ArrayElementValueType | null {
  if (!block || visitedBlockIds.has(block.id)) return null
  visitedBlockIds.add(block.id)

  if (block.type === valueTypes.Array) {
    return (block as ArrayBlock).type_
  }

  if (block.type === 'constant_get') {
    const constantGetBlock = block as ConstantGetBlock
    const constant = constantGetBlock.constant
    if (!constant || constant.valueType !== 'array' || visitedConstantNames.has(constant.name)) return null

    visitedConstantNames.add(constant.name)

    const definitionBlock = getConstantDefinitionBlock(block.workspace, constant.name)
    const definitionValueBlock = definitionBlock?.getInput(CONSTANT_DEFINITION_VALUE_INPUT)?.connection?.targetBlock() ?? null
    return getArrayElementTypeFromBlock(definitionValueBlock, visitedBlockIds, visitedConstantNames)
  }

  return null
}

function getArrayElementTypeCheck(block: Blockly.Block) {
  const targetBlock = block.getInputTargetBlock(ITEM_AT_INDEX_ARRAY_INPUT)
  const arrayElementType = getArrayElementTypeFromBlock(targetBlock)

  if (arrayElementType) {
    return getConstantValueTypeCheck(arrayElementType)
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

function getInputNameForTargetBlock(block: Blockly.Block, targetBlock: Blockly.Block) {
  for (const input of block.inputList) {
    if (input.connection?.targetBlock()?.id === targetBlock.id) return input.name ?? null
  }
  return null
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

function syncForEachItemLabel(forEachItemBlock: ForEachItemBlock) {
  if (!forEachItemBlock.parentId_) return

  const parentBlock = forEachItemBlock.workspace.getBlockById(forEachItemBlock.parentId_)
  if (!parentBlock || parentBlock.type !== FOR_EACH_IN_ARRAY_BLOCK_TYPE) return

  const parentForEachBlock = parentBlock as ForEachBlock
  const nextName = parentForEachBlock.itemName_ || 'item'

  if (forEachItemBlock.itemName_ !== nextName) {
    mutateExtraState(forEachItemBlock, () => {
      forEachItemBlock.itemName_ = nextName
    })
  }

  const labelField = forEachItemBlock.getField(FOR_EACH_ITEM_NAME_FIELD)
  if (labelField) labelField.setValue(nextName)
}

function getForEachItemTypeFromParent(forEachItemBlock: ForEachItemBlock) {
  if (!forEachItemBlock.parentId_) return null

  const parentBlock = forEachItemBlock.workspace.getBlockById(forEachItemBlock.parentId_)
  if (!parentBlock || parentBlock.type !== FOR_EACH_IN_ARRAY_BLOCK_TYPE) return null

  const arrayBlock = parentBlock.getInput(FOR_EACH_ARRAY_INPUT)?.connection?.targetBlock() ?? null
  return getArrayElementTypeFromBlock(arrayBlock)
}

function syncForEachItemOutputType(forEachItemBlock: ForEachItemBlock) {
  const nextType = getForEachItemTypeFromParent(forEachItemBlock) ?? forEachItemBlock.itemType_ ?? null

  if (nextType !== forEachItemBlock.itemType_) {
    mutateExtraState(forEachItemBlock, () => {
      forEachItemBlock.itemType_ = nextType
    })
  }

  forEachItemBlock.setOutput(true, nextType ? getConstantValueTypeCheck(nextType) : Object.values(constantValueTypeChecks))
}

function syncForEachItemName(forEachBlock: ForEachBlock) {
  const nextName = (forEachBlock.getFieldValue(FOR_EACH_ITEM_NAME_FIELD) ?? 'item').trim() || 'item'

  if (nextName !== forEachBlock.itemName_) {
    mutateExtraState(forEachBlock, () => {
      forEachBlock.itemName_ = nextName
    })
  }
}

function syncForEachItemBlocks(workspace: Blockly.Workspace) {
  workspace.getBlocksByType(FOR_EACH_ITEM_BLOCK_TYPE, false).forEach(block => {
    const itemBlock = block as ForEachItemBlock
    syncForEachItemLabel(itemBlock)
    syncForEachItemOutputType(itemBlock)
    updateForEachItemWarning(itemBlock)
  })
}

function isForEachItemAttachedToParent(forEachItemBlock: ForEachItemBlock) {
  if (!forEachItemBlock.parentId_) return false

  const parentBlock = forEachItemBlock.workspace.getBlockById(forEachItemBlock.parentId_)
  if (!parentBlock || parentBlock.type !== FOR_EACH_IN_ARRAY_BLOCK_TYPE) return false

  let currentBlock: Blockly.Block = forEachItemBlock
  while (currentBlock.getParent() && currentBlock.getParent() !== parentBlock) {
    currentBlock = currentBlock.getParent() as Blockly.Block
  }

  if (currentBlock.getParent() !== parentBlock) return false

  const inputName = getInputNameForTargetBlock(parentBlock, currentBlock)
  return inputName === FOR_EACH_BODY_INPUT
}

function updateForEachItemWarning(forEachItemBlock: ForEachItemBlock) {
  if (forEachItemBlock.isDeadOrDying() || forEachItemBlock.isInFlyout) return

  forEachItemBlock.setWarningText(
    isForEachItemAttachedToParent(forEachItemBlock)
      ? null
      : 'Must be inside a "for each..." block'
  )
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

const forEachInArrayBlockSpec: BlockSpec = {
  type: FOR_EACH_IN_ARRAY_BLOCK_TYPE,
  category: 'array',
  init(this: Blockly.Block) {
    const block = this as ForEachBlock

    bindExtraState<ForEachBlock, ForEachBlockState>(block, {
      itemName_: 'item',
    })

    block.setColour(colours.array)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setPreviousStatement(true)
    block.setNextStatement(true)
    block.setInputsInline(true)

    block.updateShape_ = function(this: ForEachBlock) {
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      const itemNameField = new Blockly.FieldTextInput(this.itemName_ || 'item')
      itemNameField.setValidator(value => {
        const nextName = (value ?? 'item').trim() || 'item'
        mutateExtraState(this, () => {
          this.itemName_ = nextName
        })
        return nextName
      })

      this.appendDummyInput('HEADER')
        .appendField('for each')
        .appendField(itemNameField, FOR_EACH_ITEM_NAME_FIELD)
        .appendField('in')

      this.appendValueInput(FOR_EACH_ARRAY_INPUT)
        .setCheck(valueTypes.Array)

      this.appendStatementInput(FOR_EACH_BODY_INPUT)
        .appendField('do')
    }

    block.onchange = function(this: Blockly.Block) {
      syncForEachItemName(this as ForEachBlock)
    }

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    return new ArrayForNode(
      valueToIr(block, FOR_EACH_ARRAY_INPUT),
      statementToIr(block, FOR_EACH_BODY_INPUT) as CommandNode[],
      block.getFieldValue(FOR_EACH_ITEM_NAME_FIELD),
      block.id,
    )
  },
}

const forEachItemBlockSpec: BlockSpec = {
  type: FOR_EACH_ITEM_BLOCK_TYPE,
  init(this: Blockly.Block) {
    const block = this as ForEachItemBlock
    bindExtraState<ForEachItemBlock, ForEachItemBlockState>(block, {
      parentId_: null,
      itemName_: 'item',
      itemType_: null,
    })

    block.setColour(colours.variable)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setOutput(true, Object.values(constantValueTypeChecks))

    block.updateShape_ = function(this: ForEachItemBlock) {
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      this.appendDummyInput('input')
        .appendField(new Blockly.FieldLabelSerializable(this.itemName_ || 'item'), FOR_EACH_ITEM_NAME_FIELD)
    }

    block.onchange = function(this: ForEachItemBlock) {
      syncForEachItemLabel(this)
      syncForEachItemOutputType(this)
      updateForEachItemWarning(this)
    }

    block.updateShape_()
    syncForEachItemOutputType(block)
    updateForEachItemWarning(block)
  },
  generator(block: Blockly.Block) {
    return new ArrayForItemNode((block as ForEachItemBlock).itemName_, block.id)
  },
}

function getForEachItemBlocks(workspace?: Blockly.Workspace) {
  if (!workspace) return []

  return workspace.getBlocksByType(FOR_EACH_IN_ARRAY_BLOCK_TYPE, false).map(block => {
    const forEachBlock = block as ForEachBlock
    return {
      kind: 'block',
      type: FOR_EACH_ITEM_BLOCK_TYPE,
      extraState: {
        parentId_: forEachBlock.id,
        itemName_: forEachBlock.itemName_ || 'item',
        itemType_: getArrayElementTypeFromBlock(forEachBlock.getInput(FOR_EACH_ARRAY_INPUT)?.connection?.targetBlock() ?? null),
      },
    }
  })
}

export function subscribeListeners(workspace: Blockly.WorkspaceSvg) {
  const changeListener = (e: Blockly.Events.Abstract) => {
    if (states.deserializing) return

    if (
      e.type === Blockly.Events.BLOCK_CREATE
      || e.type === Blockly.Events.BLOCK_DELETE
      || e.type === Blockly.Events.BLOCK_CHANGE
    ) {
      syncForEachItemBlocks(workspace)
      workspace.updateToolbox({
        kind: 'categoryToolbox',
        contents: getToolboxContents(workspace)
      })
    }
  }

  workspace.addChangeListener(changeListener)
  return () => workspace.removeChangeListener(changeListener)
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
  forEachInArrayBlockSpec,
  forEachItemBlockSpec,
  arrayItemBlockSpec,
  itemAtIndexBlockSpec,
]

export {getForEachItemBlocks}
