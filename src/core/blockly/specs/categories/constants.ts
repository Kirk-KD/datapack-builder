import type {BlockSpec} from '../types.ts'
import * as Blockly from 'blockly'
import {bindExtraState, mutateExtraState, type StatefulBlock} from '../extraState.ts'
import {constantRegistry, type ConstantRegistryEntry, type ConstantValueType} from '../../registry'
import {colours} from '../../colours.ts'
import getToolboxContents from '../../getToolboxContents.ts'
import {states} from '../../states.ts'

const INPUT_VALUE = 'VALUE'

type ConstantBlockState = {
  constant: ConstantRegistryEntry | null
}

type ConstantDefBlock = StatefulBlock & ConstantBlockState

type ConstantGetBlock = StatefulBlock & ConstantBlockState

const constantValueChecks: Record<ConstantValueType, string> = {
  int: 'mc_int',
  string: 'mc_string',
  position: 'mc_block_pos',
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
        check: ['constant_def']
      }
    ]
  },
  generator(block: Blockly.Block) {
    void block
    // TODO stub
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
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      if (!this.constant) {
        this.setWarningText('Missing constant')
        this.appendDummyInput('input').appendField('Missing constant')
        return
      }

      this.setWarningText(null)
      this.appendDummyInput('input')
        .appendField(this.constant.valueType)
        .appendField(this.constant.name)

      this.appendValueInput(INPUT_VALUE)
        .setCheck(getConstantValueCheck(this.constant.valueType))
        .appendField('=')
    }

    constantRegistry.subscribe(() => {
      syncConstantState(block)
    })

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    void block
    // TODO stub
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
    void block
    // TODO stub
  }
}

export const constantsBlockSpecs: BlockSpec[] = [
  constantsBlockSpec,
  constantDefBlockSpec,
  constantGetBlockSpec,
]

export function getConstantGetBlocks() {
  const constants = constantRegistry.list()
  if (constants.length === 0) return []

  return constants.map(constant => ({
    kind: 'block',
    type: 'constant_get',
    extraState: {
      constant,
    },
  }))
}

export function subscribeListeners(workspace: Blockly.WorkspaceSvg) {
  const unsubscribes = [
    constantRegistry.subscribe(({type, changedEntries}) => {
      if (type === 'add') {
        changedEntries.forEach(constant => {
          const block = createConstantDefinitionBlock(workspace, constant)

          const workspaceCoordinates = workspace.getMetricsManager().getViewMetrics(true)
          const x = workspaceCoordinates.left + workspaceCoordinates.width / 2
          const y = workspaceCoordinates.top + workspaceCoordinates.height / 2

          block.moveTo(new Blockly.utils.Coordinate(x, y))
        })
      }
    }),
    constantRegistry.subscribe(() => {
      workspace.updateToolbox({
        kind: 'categoryToolbox',
        contents: getToolboxContents()
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
    }
  })

  return () => unsubscribes.forEach(f => f())
}
