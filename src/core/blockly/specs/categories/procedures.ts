import type { BlockSpec } from '../types'
import {bindExtraState, mutateExtraState, type StatefulBlock} from "../extraState.ts";
import {procedureRegistry, type ProcedureParameterRegistryEntry, type ProcedureRegistryEntry} from "../../registry";
import * as Blockly from "blockly";
import {colours} from "../../colours.ts";
import getToolboxContents from "../../getToolboxContents.ts";
import {ProcedureDefinitionNode} from '../../../compiler/ir'
import {nextBlocksToIr} from '../../../compiler/generator'

type ProcBlockState = {
  procedure: ProcedureRegistryEntry | null
}
type ProcDefBlock = StatefulBlock & ProcBlockState & {
  isRestoringProcedureState_?: boolean
}
type ProcCallBlock = StatefulBlock & ProcBlockState
type ProcParamBlockState = ProcBlockState & {
  parameter: ProcedureParameterRegistryEntry | null
}
type ProcParamBlock = StatefulBlock & ProcParamBlockState

function syncProcedureState(block: ProcDefBlock | ProcCallBlock) {
  if (block.isDeadOrDying() || block.isInFlyout || !block.procedure) return

  const currentProcedure = procedureRegistry.findById(block.procedure.id)
  if (!currentProcedure) {
    block.dispose(false, true)
    return
  }

  if (currentProcedure !== block.procedure) {
    mutateExtraState(block, () => {
      block.procedure = currentProcedure
    })
  }

  if (!block.disposed && block.updateShape_) block.updateShape_()
}

function syncProcedureParameterState(block: ProcParamBlock) {
  if (block.isDeadOrDying() || block.isInFlyout || !block.procedure || !block.parameter) return

  const currentProcedure = procedureRegistry.findById(block.procedure.id)
  const currentParameter = procedureRegistry.findParameterById(block.parameter.id)

  if (!currentProcedure || !currentParameter || currentParameter.procedureId !== currentProcedure.id) {
    block.dispose(false, true)
    return
  }

  if (currentProcedure !== block.procedure || currentParameter !== block.parameter) {
    mutateExtraState(block, () => {
      block.procedure = currentProcedure
      block.parameter = currentParameter
    })
  }

  if (!block.disposed && block.updateShape_) block.updateShape_()
}

function createProcedureParameterBlock(
  workspace: Blockly.WorkspaceSvg,
  procedure: ProcedureRegistryEntry,
  parameter: ProcedureParameterRegistryEntry,
) {
  const block = workspace.newBlock('mc_proc_param') as ProcParamBlock
  mutateExtraState(block, () => {
    block.procedure = procedure
    block.parameter = parameter
  })
  block.updateShape_?.()

  block.initSvg()
  block.render()

  return block
}

function ensureProcedureParameterBlocks(block: ProcDefBlock) {
  if (block.isDeadOrDying() || block.isInFlyout || !block.procedure) return

  const workspace = block.workspace

  block.procedure.parameters.forEach(parameter => {
    const input = block.getInput(`PARAM_${parameter.id}`)
    const connection = input?.connection
    const targetBlock = connection?.targetBlock() as ProcParamBlock | null

    if (targetBlock?.type === 'mc_proc_param' && targetBlock.parameter?.id === parameter.id) return

    const paramBlock = createProcedureParameterBlock(workspace, block.procedure!, parameter)
    connection?.connect(paramBlock.outputConnection)
  })
}

const procDefBlockSpec: BlockSpec = {
  type: 'mc_proc_def',
  category: 'procedures',
  init(this: Blockly.Block) {
    const block = this as ProcDefBlock
    bindExtraState<ProcDefBlock, ProcBlockState>(block, {
      procedure: null
    })

    block.setColour(colours.procedures)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setNextStatement(true)
    block.setInputsInline(true)

    block.updateShape_ = function(this: ProcDefBlock) {
      const previousConnections = new Map<string, Blockly.Block>()
      for (const input of this.inputList) {
        if (!input.name) continue
        const targetBlock = input.connection?.targetBlock()
        if (targetBlock) {
          previousConnections.set(input.name, targetBlock)
        }
      }

      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      if (!this.procedure) {
        this.setWarningText('Missing procedure')
        this.appendDummyInput('input').appendField('Missing procedure')
      } else {
        this.setWarningText(null)

        const row = this.appendDummyInput('input')
          .appendField('define')
          .appendField(this.procedure.name)

        const params = this.procedure.parameters
        if (params.length) {
          row.appendField('with')
          params.forEach(parameter => {
            const inputName = `PARAM_${parameter.id}`
            this.appendValueInput(inputName)
              .setCheck('mc_proc_param')

            const previousBlock = previousConnections.get(inputName)
            if (previousBlock?.outputConnection) {
              this.getInput(inputName)?.connection?.connect(previousBlock.outputConnection)
            }
          })
        }

        if (!this.isRestoringProcedureState_) {
          ensureProcedureParameterBlocks(this)
        }
      }
    }

    const baseLoadExtraState = block.loadExtraState?.bind(block)
    block.loadExtraState = function(state) {
      this.isRestoringProcedureState_ = true
      try {
        baseLoadExtraState?.(state)
      } finally {
        this.isRestoringProcedureState_ = false
      }
    }

    procedureRegistry.subscribe(() => {
      syncProcedureState(block)
    })

    block.updateShape_()
  },
  generator(block: Blockly.Block) {
    return new ProcedureDefinitionNode(
      (block as ProcDefBlock).procedure!,
      nextBlocksToIr(block),
      block.id
    )
  }
}

const procCallBlockSpec: BlockSpec = {
  type: 'mc_proc_call',
  category: 'procedures',
  init(this: Blockly.Block) {
    const block = this as ProcCallBlock
    bindExtraState<ProcCallBlock, ProcBlockState>(block, {
      procedure: null
    })

    block.setColour(colours.procedures)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setPreviousStatement(true)
    block.setNextStatement(true)
    block.setInputsInline(true)

    block.updateShape_ = function(this: ProcCallBlock) {
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      if (!this.procedure) {
        this.setWarningText('Missing procedure')
        this.appendDummyInput('input').appendField('Missing procedure')
      } else {
        this.setWarningText(null)

        this.appendDummyInput('name')
          .appendField(this.procedure.name)

        this.procedure.parameters.forEach(parameter => {
          this.appendValueInput(`ARG_${parameter.id}`)
            .appendField(`${parameter.name}:`)
        })
      }
    }

    procedureRegistry.subscribe(() => {
      syncProcedureState(block)
    })

    block.updateShape_()
  },
  generator() {
    // TODO pending a generator/compiler refactor
    return ''
  }
}

const procParamBlockSpec: BlockSpec = {
  type: 'mc_proc_param',
  category: 'procedures',
  init(this: Blockly.Block) {
    const block = this as ProcParamBlock
    bindExtraState<ProcParamBlock, ProcParamBlockState>(block, {
      procedure: null,
      parameter: null,
    })

    block.setColour(colours.procedures)
    block.setTooltip('')
    block.setHelpUrl('')
    block.setOutput(true, 'mc_proc_param')

    block.updateShape_ = function(this: ProcParamBlock) {
      this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

      if (!this.procedure || !this.parameter) {
        this.setWarningText('Missing procedure parameter')
        this.appendDummyInput('input').appendField('Missing parameter')
      } else {
        this.setWarningText(null)
        this.appendDummyInput('input')
          .appendField(this.parameter.name)
      }
    }

    procedureRegistry.subscribe(() => {
      syncProcedureParameterState(block)
    })

    block.updateShape_()
  },
  generator() {
    // TODO pending a generator/compiler refactor
    return ''
  }
}

export const procedureBlockSpecs: BlockSpec[] = [
  procDefBlockSpec,
  procCallBlockSpec,
  procParamBlockSpec,
]

export function getProcCallBlocks() {
  return procedureRegistry.list().map(procedure => ({
    kind: 'block',
    type: 'mc_proc_call',
    extraState: {
      procedure,
    },
  }))
}

export function subscribeListeners(workspace: Blockly.WorkspaceSvg) {
  const unsubscribes = [
    procedureRegistry.subscribe(({type, changedEntries}) => {
      if (type === 'add') {
        changedEntries.forEach(proc => {
          const block = workspace.newBlock('mc_proc_def') as ProcDefBlock
          mutateExtraState(block, () => {
            block.procedure = proc
          })

          const workspaceCoordinates = workspace.getMetricsManager().getViewMetrics(true)
          const x = workspaceCoordinates.left + workspaceCoordinates.width / 2
          const y = workspaceCoordinates.top + workspaceCoordinates.height / 2

          block.initSvg()
          block.render()
          block.moveTo(new Blockly.utils.Coordinate(x, y))
        })
      }
    }),
    procedureRegistry.subscribe(() => {
      workspace.updateToolbox({
        kind: 'categoryToolbox',
        contents: getToolboxContents()
      })
    })
  ]

  workspace.addChangeListener((e: Blockly.Events.Abstract)=> {
    if (e.type === Blockly.Events.BLOCK_DELETE) {
      const blockDeleteEvent = e as Blockly.Events.BlockDelete
      const blockData = blockDeleteEvent.oldJson

      if (blockData && blockData.type === 'mc_proc_def') {
        const procedure = (blockData.extraState as ProcBlockState).procedure
        if (procedure) procedureRegistry.remove(procedure.id)
      }
    }
    else if (e.type === Blockly.Events.BLOCK_MOVE) {
      const moveEvent = e as Blockly.Events.BlockMove
      if (!moveEvent.blockId) return

      const movedBlock = workspace.getBlockById(moveEvent.blockId)

      if (movedBlock?.type !== 'mc_proc_param' || !moveEvent.oldParentId || moveEvent.oldInputName == null) return

      const oldParentId = moveEvent.oldParentId
      const oldParent = workspace.getBlockById(oldParentId)
      if (oldParent?.type !== 'mc_proc_def') return

      ensureProcedureParameterBlocks(oldParent as ProcDefBlock)
    }
  })

  return () => unsubscribes.forEach(f => f())
}
