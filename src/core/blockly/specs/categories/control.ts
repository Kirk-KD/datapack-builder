import * as Blockly from 'blockly'
import { addFile } from '../../../compiler/fileRegistry'
import { mcfunctionGenerator } from '../../../compiler'
import { nextId } from '../../../compiler/idGenerator'
import type { BlockSpec } from '../types'
import { setShadowState } from '../../extensions/shadows.ts'
import {getInternalNamespace, getObjectiveName, getTempVarName, getVarName} from "../../../compiler/nameManager.ts";

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
          type: 'field_dropdown',
          name: FIELD_VAR_NAME,
          options: [['x', 'X']],
        },
        {
          type: 'input_value',
          name: 'RANGE',
          check: ['mc_param', 'mc_range'],
        },
      ],
      inputsInline: true,
      output: 'MCCondition',
      extensions: ['mc_scoreboard_variable_dropdown'],
    },
    generator(block) {
      const varName = getVarName(block.getField(FIELD_VAR_NAME)!.getText())
      const obj = getObjectiveName()
      const range = mcfunctionGenerator.valueToCode(block, 'RANGE', 0) || ''
      return [`score ${varName} ${obj} matches ${range}`, 0]
    },
    setShadowBlocks(this) {
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
          type: 'field_dropdown',
          name: FIELD_VAR_NAME,
          options: [['x', 'X']],
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
      extensions: ['mc_scoreboard_variable_dropdown'],
    },
    generator(block) {
      const varA = getVarName(block.getField(FIELD_VAR_NAME)!.getText())
      const obj = getObjectiveName()
      const op = opMap[block.getFieldValue(FIELD_OP)]
      const valueBBlock = block.getInputTargetBlock(INPUT_VAR_B)!

      let fragment: string

      if (valueBBlock.type === 'mc_int') {
        const tempName = getTempVarName()
        fragment = `score ${varA} ${obj} ${op} ${tempName} ${obj}`
      } else {
        const varB = getVarName(valueBBlock.getField(FIELD_VAR_NAME)!.getText())
        fragment = `score ${varA} ${obj} ${op} ${varB} ${obj}`
      }

      return [fragment, 0]
    },
    setShadowBlocks(this) {
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
      const id = nextId('if')
      const conditionBlock = block.getInputTargetBlock(INPUT_CONDITION)!
      const setup = getConditionSetup(conditionBlock)
      const condition = mcfunctionGenerator.valueToCode(block, INPUT_CONDITION, 0)
      const doCode = mcfunctionGenerator.statementToCode(block, INPUT_DO)
      const internalNs = getInternalNamespace()

      addFile(`data/${internalNs}/function/${id}_true.mcfunction`, doCode)

      return setup
        + `execute if ${condition} run function ${internalNs}:${id}_true\n`
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
      const id = nextId('if')
      const conditionBlock = block.getInputTargetBlock(INPUT_CONDITION)!
      const setup = getConditionSetup(conditionBlock)
      const condition = mcfunctionGenerator.valueToCode(block, INPUT_CONDITION, 0)
      const doCode = mcfunctionGenerator.statementToCode(block, INPUT_DO)
      const elseCode = mcfunctionGenerator.statementToCode(block, INPUT_ELSE)
      const internalNs = getInternalNamespace()

      addFile(`data/${internalNs}/function/${id}_true.mcfunction`, doCode)
      addFile(`data/${internalNs}/function/${id}_false.mcfunction`, elseCode)

      return setup
        + `execute if ${condition} run function ${internalNs}:${id}_true\n`
        + `execute unless ${condition} run function ${internalNs}:${id}_false\n`
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
      const id = nextId('while')
      const conditionBlock = block.getInputTargetBlock(INPUT_CONDITION)!
      const setup = getConditionSetup(conditionBlock)
      const condition = mcfunctionGenerator.valueToCode(block, INPUT_CONDITION, 0)
      const bodyCode = mcfunctionGenerator.statementToCode(block, INPUT_DO)
      const internalNs = getInternalNamespace()

      addFile(
        `data/${internalNs}/function/${id}.mcfunction`,
        `execute if ${condition} run function ${internalNs}:${id}_body\n`,
      )

      addFile(
        `data/${internalNs}/function/${id}_body.mcfunction`,
        bodyCode + setup + `function ${internalNs}:${id}\n`,
      )

      return setup + `function ${internalNs}:${id}\n`
    },
  },
]
