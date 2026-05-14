import type {BlockSpec} from '../types.ts'
import * as Blockly from 'blockly'
import {bindExtraState, mutateExtraState, type StatefulBlock} from '../extraState.ts'
import {constantRegistry, type ConstantRegistryEntry, type ConstantValueType} from '../../registry'
import {colours} from '../../colours.ts'
import getToolboxContents from '../../getToolboxContents.ts'
import {states} from '../../states.ts'
import {valueTypes} from '../valueTypes'
import {ConstantDefNode, ConstantGetNode, ConstantsNode, statementToIr, valueToIr} from '../../../compiler'

const INPUT_VALUE = 'VALUE'

type ConstantBlockState = {
  constant: ConstantRegistryEntry | null
}

type SerializedBlockState = {
  type: string
  extraState?: unknown
  inputs?: Record<string, SerializedConnectionState>
  next?: SerializedConnectionState
}

type SerializedConnectionState = {
  block?: SerializedBlockState
}

type ConstantDefBlock = StatefulBlock & ConstantBlockState

type ConstantGetBlock = StatefulBlock & ConstantBlockState

const constantValueChecks: Record<ConstantValueType, string> = {
  int: valueTypes.Int,
  string: valueTypes.String,
  position: valueTypes.Position,
  item_stack: valueTypes.ItemStack
}

function syncConstantState(block: ConstantDefBlock | ConstantGetBlock) {
  if (block.isDeadOrDying() || block.isInFlyout || !block.constant) return

  const currentConstant = constantRegistry.findById(block.constant.name)
  if (!currentConstant) {
    block.dispose(false, true)
    return
  }

  if (currentConstant !== block.constant) {
    mutateExtraState(block, () => {
      block.constant = currentConstant
    })
  }

  if (!block.disposed && block.updateShape_) block.updateShape_()
}

function getConstantValueCheck(valueType: ConstantValueType) {
  return constantValueChecks[valueType]
}

function getPreviousInputConnections(block: Blockly.Block) {
  const previousConnections = new Map<string, Blockly.Block>()
  for (const input of block.inputList) {
    if (!input.name) continue
    const targetBlock = input.connection?.targetBlock()
    if (targetBlock) {
      previousConnections.set(input.name, targetBlock)
    }
  }
  return previousConnections
}

function isInConstantsBlock(block: Blockly.Block) {
  let currentBlock = block.getParent()

  while (currentBlock) {
    if (currentBlock.type === 'constants') return true
    currentBlock = currentBlock.getParent()
  }

  return false
}

function updateConstantDefinitionWarning(block: ConstantDefBlock) {
  const warnings = []

  if (!block.constant) {
    warnings.push('Missing constant')
  }

  if (!block.isInFlyout && !isInConstantsBlock(block)) {
    warnings.push('Constants must be in a constants definition block')
  }

  block.setWarningText(warnings.length ? warnings.join('\n') : null)
}

function createConstantDefinitionBlock(
  workspace: Blockly.WorkspaceSvg,
  constant: ConstantRegistryEntry,
) {
  const block = workspace.newBlock('constant_def') as ConstantDefBlock
  mutateExtraState(block, () => {
    block.constant = constant
  })
  block.updateShape_?.()

  block.initSvg()
  block.render()

  return block
}

function findConstantsBlock(workspace: Blockly.Workspace) {
  return workspace.getBlocksByType('constants', false)[0] ?? null
}

function getConstantDefinitionFromBlockState(blockState: SerializedBlockState) {
  if (blockState.type !== 'constant_def') return null

  const state = blockState.extraState as Partial<ConstantBlockState> | undefined
  return state?.constant ?? null
}

function removeConstantDefinitionStack(blockState: SerializedBlockState | undefined) {
  let currentBlockState = blockState

  while (currentBlockState) {
    const constant = getConstantDefinitionFromBlockState(currentBlockState)
    if (constant) constantRegistry.remove(constant.name)

    currentBlockState = currentBlockState.next?.block
  }
}

function getLastStackBlock(firstBlock: Blockly.Block) {
  let current = firstBlock
  while (current.getNextBlock()) {
    current = current.getNextBlock() as Blockly.Block
  }
  return current
}

function attachConstantDefinitionBlock(
  constantsBlock: Blockly.Block,
  definitionBlock: ConstantDefBlock,
) {
  const definitionInput = constantsBlock.getInput('DEFINITIONS')
  const definitionConnection = definitionInput?.connection
  if (!definitionConnection || !definitionBlock.previousConnection) return

  const firstDefinitionBlock = definitionConnection.targetBlock()
  if (!firstDefinitionBlock) {
    definitionConnection.connect(definitionBlock.previousConnection)
    return
  }

  const lastBlock = getLastStackBlock(firstDefinitionBlock)
  if (lastBlock.nextConnection) {
    lastBlock.nextConnection.connect(definitionBlock.previousConnection)
  }
}

function placeConstantDefinitionBlock(
  workspace: Blockly.WorkspaceSvg,
  constant: ConstantRegistryEntry,
) {
  const definitionBlock = createConstantDefinitionBlock(workspace, constant)
  const constantsBlock = findConstantsBlock(workspace)

  if (constantsBlock) {
    attachConstantDefinitionBlock(constantsBlock, definitionBlock)
    return
  }

  const newConstantsBlock = workspace.newBlock('constants')
  newConstantsBlock.initSvg()
  newConstantsBlock.render()

  const workspaceCoordinates = workspace.getMetricsManager().getViewMetrics(true)
  const x = workspaceCoordinates.left + workspaceCoordinates.width / 2
  const y = workspaceCoordinates.top + workspaceCoordinates.height / 2
  newConstantsBlock.moveTo(new Blockly.utils.Coordinate(x, y))

  attachConstantDefinitionBlock(newConstantsBlock, definitionBlock)
}

const constantsBlockSpec: BlockSpec = {
  type: 'constants',
  category: 'constants',
  json: {
    type: 'constants',
    message0: 'define constants',
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'DEFINITIONS',
        check: [valueTypes.ConstantDef]
      }
    ]
  },
  generator(block: Blockly.Block) {
    return new ConstantsNode(
      statementToIr(block, 'DEFINITIONS') as ConstantDefNode[],
      block.id
    )
  }
}

const constantDefBlockSpec: BlockSpec = {
  type: 'constant_def',
  category: 'constants',
  init(this: Blockly.Block) {
    const block = this as ConstantDefBlock
    bindExtraState<ConstantDefBlock, ConstantBlockState>(block, {
      constant: null
    })

    block.setColour(colours.constants)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setPreviousStatement(true)
    block.setNextStatement(true)
    block.setInputsInline(true)

    block.updateShape_ = function(this: ConstantDefBlock) {
      const previousConnections = getPreviousInputConnections(this)

      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      if (!this.constant) {
        updateConstantDefinitionWarning(this)
        this.appendDummyInput('input').appendField('Missing constant')
        return
      }

      updateConstantDefinitionWarning(this)
      this.appendDummyInput('input')
        .appendField(this.constant.name)
        .appendField(`(${this.constant.valueType})`)

      this.appendValueInput(INPUT_VALUE)
        .setCheck(getConstantValueCheck(this.constant.valueType))
        .appendField('=')

      const previousBlock = previousConnections.get(INPUT_VALUE)
      if (previousBlock?.outputConnection) {
        this.getInput(INPUT_VALUE)?.connection?.connect(previousBlock.outputConnection)
      }
    }

    block.onchange = function(this: ConstantDefBlock) {
      updateConstantDefinitionWarning(this)
    }

    constantRegistry.subscribe(() => {
      syncConstantState(block)
    })

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    return new ConstantDefNode(
      (block as ConstantDefBlock).constant!,
      valueToIr(block, INPUT_VALUE),
      block.id
    )
  }
}

const constantGetBlockSpec: BlockSpec = {
  type: 'constant_get',
  category: 'constants',
  init(this: Blockly.Block) {
    const block = this as ConstantGetBlock
    bindExtraState<ConstantGetBlock, ConstantBlockState>(block, {
      constant: null
    })

    block.setColour(colours.constants)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setInputsInline(true)
    block.setOutput(true)

    block.updateShape_ = function(this: ConstantGetBlock) {
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      if (!this.constant) {
        this.setWarningText('Missing constant')
        this.appendDummyInput('input').appendField('Missing constant')
        this.setOutput(true)
        return
      }

      this.setWarningText(null)
      this.appendDummyInput('input').appendField(this.constant.name)
      this.setOutput(true, getConstantValueCheck(this.constant.valueType))
    }

    constantRegistry.subscribe(() => {
      syncConstantState(block)
    })

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    return new ConstantGetNode(
      (block as ConstantGetBlock).constant!,
      block.id
    )
  }
}

export const constantsBlockSpecs: BlockSpec[] = [
  constantsBlockSpec,
  constantDefBlockSpec,
  constantGetBlockSpec,
]

export function getConstantBlocks(workspace?: Blockly.Workspace) {
  const constants = constantRegistry.list()

  const blocks = constants.map(constant => ({
    kind: 'block',
    type: 'constant_get',
    extraState: {
      constant,
    },
  }))

  if (constants.length !== 0 && (!workspace || !findConstantsBlock(workspace))) {
    return [
      {
        kind: 'block',
        type: 'constants',
      },
      ...blocks,
    ]
  }

  return blocks
}

export function subscribeListeners(workspace: Blockly.WorkspaceSvg) {
  const unsubscribes = [
    constantRegistry.subscribe(({type, changedEntries}) => {
      if (type === 'add') {
        changedEntries.forEach(constant => {
          placeConstantDefinitionBlock(workspace, constant)
        })
      }
    }),
    constantRegistry.subscribe(() => {
      workspace.updateToolbox({
        kind: 'categoryToolbox',
        contents: getToolboxContents(workspace)
      })
    })
  ]

  workspace.addChangeListener((e: Blockly.Events.Abstract) => {
    if (states.deserializing) return

    if (e.type === Blockly.Events.BLOCK_DELETE) {
      const blockDeleteEvent = e as Blockly.Events.BlockDelete
      const blockData = blockDeleteEvent.oldJson

      if (blockData && blockData.type === 'constant_def') {
        const constant = (blockData.extraState as ConstantBlockState).constant
        if (constant) constantRegistry.remove(constant.name)
      }
      else if (blockData && blockData.type === 'constants') {
        const constantsBlockData = blockData as SerializedBlockState
        removeConstantDefinitionStack(constantsBlockData.inputs?.DEFINITIONS?.block)
        workspace.updateToolbox({
          kind: 'categoryToolbox',
          contents: getToolboxContents(workspace)
        })
      }
    }
    else if (e.type === Blockly.Events.BLOCK_CREATE) {
      const blockCreateEvent = e as Blockly.Events.BlockCreate
      const block = blockCreateEvent.blockId ? workspace.getBlockById(blockCreateEvent.blockId) : null

      if (block?.type === 'constants') {
        workspace.updateToolbox({
          kind: 'categoryToolbox',
          contents: getToolboxContents(workspace)
        })
      }
    }
  })

  return () => unsubscribes.forEach(f => f())
}
