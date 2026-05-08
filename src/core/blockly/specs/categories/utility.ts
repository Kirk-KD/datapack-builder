import type {BlockSpec} from '../types.ts'
import * as Blockly from 'blockly'
import {bindExtraState, type StatefulBlock} from '../extraState.ts'
import {colours} from '../../colours.ts'
import {setShadowState} from '../../extensions/shadows.ts'
import {createStateDropdown} from '../dynamicFields.ts'
import {CommandNode, RaycastEntityNode, statementToIr, valueToIr} from '../../../compiler'

type RaycastBlockStates = { mode: 'entity' | 'block' }
type RaycastBlock = StatefulBlock & RaycastBlockStates
export const utilityBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_raycast',
    category: 'utility',
    init(this: Blockly.Block) {
      const block = this as RaycastBlock

      bindExtraState<RaycastBlock, RaycastBlockStates>(block, {
        mode: 'entity'
      })

      block.updateShape_ = function(this: RaycastBlock) {
        this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

        this.appendDummyInput('0')
          .appendField('raycast')
          .appendField(createStateDropdown(this, 'mode', [
            ['entity', 'entity'],
            ['block', 'block'],
          ], { rerender: true }), 'MODE')

        const mode = this.getFieldValue('MODE')
        if (mode === 'entity') {
          this.appendValueInput('TARGET')
            .setCheck('mc_target_selector')
          setShadowState(this, 'TARGET', { type: 'mc_target_selector' })
        } else {
          this.appendValueInput('BLOCK')
            .setCheck('mc_string')
          setShadowState(this, 'BLOCK', { type: 'mc_string', fields: { VALUE: 'stone' } })
        }

        this.appendValueInput('DISTANCE')
          .appendField('within')
          .setCheck(['mc_int', 'mc_proc_param'])
        setShadowState(this, 'DISTANCE', { type: 'mc_int', fields: { VALUE: 5 } })

        this.appendDummyInput('1')
          .appendField('blocks')

        this.appendStatementInput('BODY')
          .appendField('if hit, do')
      }

      block.setColour(colours.utility)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setPreviousStatement(true)
      block.setNextStatement(true)

      block.updateShape_()
    },
    generator(block) {
      return new RaycastEntityNode(
        valueToIr(block, 'TARGET'),
        valueToIr(block, 'DISTANCE'),
        statementToIr(block, 'BODY') as CommandNode[],
        block.id
      )
      // TODO handle block mode
    }
  }
]
