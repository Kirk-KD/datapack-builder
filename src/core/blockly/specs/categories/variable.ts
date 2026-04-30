import { mcfunctionGenerator } from '../../../compiler'
import { getConditionSetup } from './control'
import type { BlockSpec } from '../types'
import { setShadowState } from '../../extensions/shadows.ts'
import {getObjectiveName, getTempVarName, getVarName} from "../../../compiler/nameManager.ts";
import * as Blockly from "blockly";
import {FieldDropdown} from "blockly";
import {colours} from "../../colours.ts";
import {bindExtraState, mutateExtraState, type StatefulBlock} from "../extraState.ts";
import {variableRegistry, type VariableRegistryEntry} from "../../registry";

const FIELD_VAR_NAME = 'VAR_NAME'
const FIELD_OP = 'OP'
const INPUT_VALUE = 'VALUE'
const VAR_SET_CHECKS = ['mc_int', 'MCCondition', 'mc_var_get', 'mc_param']

function isConditionBlock(type: string): boolean {
  return type.startsWith('mc_comp_')
}

type VarBlockStates = {
  variable?: VariableRegistryEntry
}
type VarBlock = StatefulBlock & VarBlockStates

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
      const varName = mcfunctionGenerator.valueToCode(block, FIELD_VAR_NAME, 0)
      const obj = getObjectiveName()
      const valueBlock = block.getInputTargetBlock(INPUT_VALUE)!

      if (isConditionBlock(valueBlock.type)) {
        const setup = getConditionSetup(valueBlock)
        const condition = mcfunctionGenerator.valueToCode(block, INPUT_VALUE, 0)
        return setup
          + `execute if ${condition} run scoreboard players set ${varName} ${obj} 1\n`
          + `execute unless ${condition} run scoreboard players set ${varName} ${obj} 0\n`
      }

      if (valueBlock.type === 'mc_var_get') {
        const srcName = mcfunctionGenerator.valueToCode(block, INPUT_VALUE, 0)
        return `scoreboard players operation ${varName} ${obj} = ${srcName} ${obj}\n`
      }

      if (valueBlock.type === 'mc_int' || valueBlock.type === 'mc_param') {
        const valueCode = mcfunctionGenerator.blockToCode(valueBlock)[0]
        return `scoreboard players set ${varName} ${obj} ${valueCode}\n`
      }

      return ''
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
            ['+=', 'ADD'],
            ['-=', 'SUB'],
            ['*=', 'MUL'],
            ['/=', 'DIV'],
            ['%=', 'MOD'],
          ],
        },
        {
          type: 'input_value',
          name: INPUT_VALUE,
          check: ['mc_param', 'mc_int', 'mc_var_get'],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true
    },
    generator(block) {
      const varName = mcfunctionGenerator.valueToCode(block, FIELD_VAR_NAME, 0)
      const obj = getObjectiveName()
      const opType = block.getFieldValue(FIELD_OP)
      const valueBlock = block.getInputTargetBlock(INPUT_VALUE)!
      const isLiteral = valueBlock.type === 'mc_int'
      const num = isLiteral ? valueBlock.getFieldValue('VALUE') : null
      const srcName = !isLiteral ? mcfunctionGenerator.valueToCode(block, INPUT_VALUE, 0) : null

      if (isLiteral && opType === 'ADD') {
        return `scoreboard players add ${varName} ${obj} ${num}\n`
      }
      if (isLiteral && opType === 'SUB') {
        return `scoreboard players remove ${varName} ${obj} ${num}\n`
      }
      if (isLiteral) {
        const opMap: Record<string, string> = { MUL: '*=', DIV: '/=', MOD: '%=' }
        const tempName = getTempVarName()
        return `scoreboard players set ${tempName} ${obj} ${num}\n`
          + `scoreboard players operation ${varName} ${obj} ${opMap[opType]} ${tempName} ${obj}\n`
      }

      const opMap: Record<string, string> = { ADD: '+=', SUB: '-=', MUL: '*=', DIV: '/=', MOD: '%=' }
      return `scoreboard players operation ${varName} ${obj} ${opMap[opType]} ${srcName} ${obj}\n`
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
            variableList.map(({name, id}) => [name, id]),
            newVariableId => {
              this.variable = variableRegistry.findById(newVariableId)
              return newVariableId
            }
          )
          dropdown.setValue(this.variable.id)

          this.appendDummyInput('input')
            .appendField(dropdown, FIELD_VAR_NAME)

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
      const name = (block as VarBlock).variable!.name
      return [getVarName(name), 0]
    },
  },
]
