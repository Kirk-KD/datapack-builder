import type { BlockSpec } from '../types'
import {bindExtraState, mutateExtraState, type StatefulBlock} from "../extraState.ts";
import {procedureRegistry, type ProcedureRegistryEntry} from "../../registry";
import * as Blockly from "blockly";
import {colours} from "../../colours.ts";
import getToolboxContents from "../../getToolboxContents.ts";

type ProcBlockState = {
  procedure: ProcedureRegistryEntry | null
}
type ProcDefBlock = StatefulBlock & ProcBlockState

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

    block.updateShape_ = function(this: ProcDefBlock) {
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
          params.forEach(p => row.appendField(p.name))
        }
      }
    }

    procedureRegistry.subscribe(() => {
      syncProcedureState(block)
    })

    block.updateShape_()
  }
}

type ProcCallBlock = StatefulBlock & ProcBlockState
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
  }
}

export const procedureBlockSpecs: BlockSpec[] = [
  procDefBlockSpec,
  procCallBlockSpec
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
    if (e.type === 'delete') {
      const blockDeleteEvent = e as Blockly.Events.BlockDelete
      const blockData = blockDeleteEvent.oldJson

      if (blockData && blockData.type === 'mc_proc_def') {
        const procedure = (blockData.extraState as ProcBlockState).procedure
        if (procedure) procedureRegistry.remove(procedure.id)
      }
    }
  })

  return () => unsubscribes.forEach(f => f())
}
