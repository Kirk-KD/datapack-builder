import * as Blockly from 'blockly'
import type { BlockSpec } from '../types'
import { setShadowState } from '../../extensions/shadows.ts'
import {
  IfNode,
  LiteralIntNode,
  LiteralRangeNode, type OrParameter,
  VariableCompareNode,
  type VariableCompareOpType,
  VariableMatchesNode,
  VariableNode, WhileNode
} from '../../../compiler/ir'
import {statementToIr, valueToIr} from '../../../compiler/generator'

const FIELD_VAR_NAME = 'VAR_NAME'
const FIELD_OP = 'OP'
const INPUT_VAR_B = 'VAR_B'
const INPUT_CONDITION = 'CONDITION'
const INPUT_DO = 'DO'
const INPUT_ELSE = 'ELSE'

const opMap: Record<string, string> = {
  LT: '<',
  LTE: '<=',
  EQ: '=',
  GTE: '>=',
  GT: '>',
}

export function getConditionSetup(conditionBlock: Blockly.Block): string {
  if (conditionBlock.type === 'mc_comp_score_compare') {
    const valueBBlock = conditionBlock.getInputTargetBlock(INPUT_VAR_B)
    if (valueBBlock?.type === 'mc_int') {
      const num = valueBBlock.getFieldValue('VALUE')
      const tempName = getTempVarName()
      const obj = getObjectiveName()
      return `scoreboard players set ${tempName} ${obj} ${num}\n`
    }
  }
  return ''
}

export const controlBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_comp_score_matches',
    category: 'control',
    json: {
      type: 'mc_comp_score_matches',
      message0: '%1 matches %2',
      args0: [
        {
          type: 'input_value',
          name: FIELD_VAR_NAME,
          check: ['mc_var_get']
        },
        {
          type: 'input_value',
          name: 'RANGE',
          check: ['mc_param', 'mc_range'],
        },
      ],
      inputsInline: true,
      output: 'MCCondition',
    },
    generator(block) {
      return new VariableMatchesNode(
        valueToIr(block, FIELD_VAR_NAME),
        valueToIr(block, 'RANGE'),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, FIELD_VAR_NAME, { type: 'mc_var_get' })
      setShadowState(this, 'RANGE', { type: 'mc_range' })
    },
  },
  {
    type: 'mc_comp_score_compare',
    category: 'control',
    json: {
      type: 'mc_comp_score_compare',
      message0: '%1 %2 %3',
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
            ['<', 'LT'],
            ['<=', 'LTE'],
            ['=', 'EQ'],
            ['>=', 'GTE'],
            ['>', 'GT'],
          ],
        },
        {
          type: 'input_value',
          name: INPUT_VAR_B,
          check: ['mc_param', 'mc_int', 'mc_var_get'],
        },
      ],
      inputsInline: true,
      output: 'MCCondition',
    },
    generator(block) {
      return new VariableCompareNode(
        valueToIr(block, FIELD_VAR_NAME),
        block.getFieldValue(FIELD_OP) as VariableCompareOpType,
        valueToIr(block, INPUT_VAR_B),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, FIELD_VAR_NAME, {
        type: 'mc_var_get'
      })
      setShadowState(this, INPUT_VAR_B, {
        type: 'mc_int',
        fields: { VALUE: 0 },
      })
    },
  },
  {
    type: 'mc_if',
    category: 'control',
    json: {
      type: 'mc_if',
      message0: 'if %1',
      args0: [
        {
          type: 'input_value',
          name: INPUT_CONDITION,
          check: ['mc_param', 'MCCondition'],
        },
      ],
      message1: 'then %1',
      args1: [
        {
          type: 'input_statement',
          name: INPUT_DO,
        },
      ],
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      return new IfNode(
        valueToIr(block, INPUT_CONDITION),
        statementToIr(block, INPUT_DO),
        [],
        block.id
      )
    },
  },
  {
    type: 'mc_if_else',
    category: 'control',
    json: {
      type: 'mc_if_else',
      message0: 'if %1',
      args0: [
        {
          type: 'input_value',
          name: INPUT_CONDITION,
          check: ['mc_param', 'MCCondition'],
        },
      ],
      message1: 'then %1',
      args1: [
        {
          type: 'input_statement',
          name: INPUT_DO,
        },
      ],
      message2: 'else %1',
      args2: [
        {
          type: 'input_statement',
          name: INPUT_ELSE,
        },
      ],
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      return new IfNode(
        valueToIr(block, INPUT_CONDITION),
        statementToIr(block, INPUT_DO),
        statementToIr(block, INPUT_ELSE),
        block.id
      )
    },
  },
  {
    type: 'mc_while',
    category: 'control',
    json: {
      type: 'mc_while',
      message0: 'repeat while %1',
      args0: [
        {
          type: 'input_value',
          name: INPUT_CONDITION,
          check: 'MCCondition',
        },
      ],
      message1: 'do %1',
      args1: [
        {
          type: 'input_statement',
          name: INPUT_DO,
        },
      ],
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      return new WhileNode(
        valueToIr(block, INPUT_CONDITION),
        statementToIr(block, INPUT_DO),
        block.id
      )
    },
  },
]
