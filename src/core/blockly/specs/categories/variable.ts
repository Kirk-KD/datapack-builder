import type { BlockSpec } from '../types'
import { setShadowState } from '../../extensions/shadows.ts'
import * as Blockly from "blockly";
import {FieldDropdown} from "blockly";
import {colours} from "../../colours.ts";
import {bindExtraState, mutateExtraState, type StatefulBlock} from "../extraState.ts";
import {variableRegistry, type VariableRegistryEntry} from "../../registry";
import {VariableNode, VariableOperationNode, type VariableOpType, VariableSetNode} from '../../../compiler/ir'
import {valueToIr} from '../../../compiler/generator'

const FIELD_VAR_NAME = 'VAR_NAME'
const FIELD_OP = 'OP'
const INPUT_VALUE = 'VALUE'
const VAR_SET_CHECKS = ['mc_int', 'mc_var_get', 'mc_proc_param']

type VarBlockStates = {
  variable?: VariableRegistryEntry
}
type VarBlock = StatefulBlock & VarBlockStates

function getVariableDropdownOptions(): [string, string][] {
  return variableRegistry.list().map(({name, id}) => [name, id])
}

export const variableBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_var_set',
    category: 'variable',
    json: {
      type: 'mc_var_set',
      message0: 'set %1 to %2',
      args0: [
        {
          type: 'input_value',
          name: FIELD_VAR_NAME,
          check: ['mc_var_get']
        },
        {
          type: 'input_value',
          name: INPUT_VALUE,
          check: VAR_SET_CHECKS,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
    },
    generator(block) {
      return new VariableSetNode(
        valueToIr(block, FIELD_VAR_NAME),
        valueToIr(block, INPUT_VALUE),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, INPUT_VALUE, {
        type: 'mc_int',
        fields: { VALUE: 0 },
      })
      setShadowState(this, FIELD_VAR_NAME, {
        type: 'mc_var_get'
      })
    },
  },
  {
    type: 'mc_var_change',
    category: 'variable',
    json: {
      type: 'mc_var_change',
      message0: 'change %1 %2 by %3',
      args0: [
        {
          type: 'input_value',
          name: FIELD_VAR_NAME,
          check: ['mc_var_get']
        },
        {
          type: 'field_dropdown',
          name: FIELD_OP,
          options: [
            ['+=', '+='],
            ['-=', '-='],
            ['*=', '*='],
            ['/=', '/='],
            ['%=', '%='],
          ],
        },
        {
          type: 'input_value',
          name: INPUT_VALUE,
          check: ['mc_proc_param', 'mc_int', 'mc_var_get'],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true
    },
    generator(block) {
      return new VariableOperationNode(
        valueToIr(block, FIELD_VAR_NAME),
        block.getFieldValue(FIELD_OP) as VariableOpType,
        valueToIr(block, INPUT_VALUE),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, INPUT_VALUE, {
        type: 'mc_int',
        fields: { VALUE: 1 },
      })
      setShadowState(this, FIELD_VAR_NAME, {
        type: 'mc_var_get'
      })
    },
  },
  {
    type: 'mc_var_get',
    category: 'variable',
    init(this: Blockly.Block) {
      const block = this as VarBlock
      bindExtraState<VarBlock, VarBlockStates>(block, {
        variable: variableRegistry.list()[0]
      })

      block.updateShape_ = function(this: VarBlock) {
        this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

        const variableList = variableRegistry.list()

        if (variableList.length === 0 || !this.variable) {
          this.appendDummyInput('input').appendField('No variables')
          this.setWarningText('No variables to choose from')
        } else {
          const dropdown = new FieldDropdown(
            getVariableDropdownOptions,
            newVariableId => {
              const nextVariable = variableRegistry.findById(newVariableId)
              if (!nextVariable) return null

              this.variable = nextVariable
              return newVariableId
            }
          )

          this.appendDummyInput('input')
            .appendField(dropdown, FIELD_VAR_NAME)

          dropdown.setValue(this.variable.id)

          this.setWarningText(null)
        }
      }

      variableRegistry.subscribe(() => {
        mutateExtraState(block, () => {
          const entries = variableRegistry.list()
          if (entries.length === 0) block.variable = undefined
          else if (block.variable === undefined || entries.indexOf(block.variable) === -1) {
            block.variable = entries[0]
          }
        })
        if (!block.disposed && block.updateShape_) block.updateShape_()
      })

      block.setColour(colours.variable)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setOutput(true, 'mc_var_get')

      block.updateShape_()
    },
    generator(block) {
      return new VariableNode(
        (block as VarBlock).variable!.name,
        block.id
      )
    },
  },
]
