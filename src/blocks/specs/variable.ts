import { mcfunctionGenerator } from '../../compiler/generator'
import { scoreboardManager } from '../../compiler/scoreboardManager'
import { getConditionSetup } from './control'
import type { BlockSpec } from './types'
import { setShadowState } from '../extensions/shadows.ts'

const FIELD_VAR_NAME = 'VAR_NAME'
const FIELD_OP = 'OP'
const INPUT_VALUE = 'VALUE'
const scoreboardVarSetChecks = ['mc_int', 'MCCondition', 'mc_var_get', 'mc_param']

function isConditionBlock(type: string): boolean {
  return type.startsWith('mc_comp_')
}

export const variableBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_var_set',
    category: 'variable',
    tags: ['trimChainTail'],
    json: {
      type: 'mc_var_set',
      message0: 'set %1 to %2',
      args0: [
        {
          type: 'field_dropdown',
          name: FIELD_VAR_NAME,
          options: [['x', 'X']],
        },
        {
          type: 'input_value',
          name: INPUT_VALUE,
          check: scoreboardVarSetChecks,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      extensions: ['mc_scoreboard_variable_dropdown'],
    },
    generator(block) {
      const varName = scoreboardManager.getVarName(block.getField(FIELD_VAR_NAME)!.getText())
      const obj = scoreboardManager.getObjectiveName()
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
    },
  },
  {
    type: 'mc_var_change',
    category: 'variable',
    tags: ['trimChainTail'],
    json: {
      type: 'mc_var_change',
      message0: 'change %1 %2 by %3',
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
      extensions: ['mc_scoreboard_variable_dropdown'],
    },
    generator(block) {
      const varName = scoreboardManager.getVarName(block.getField(FIELD_VAR_NAME)!.getText())
      const obj = scoreboardManager.getObjectiveName()
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
        const tempName = scoreboardManager.getTempVar()
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
    },
  },
  {
    type: 'mc_var_get',
    category: 'variable',
    tags: ['scoreboardVarSet', 'procArg'],
    json: {
      type: 'mc_var_get',
      tooltip: '',
      helpUrl: '',
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: FIELD_VAR_NAME,
          options: [['x', 'X']],
        },
      ],
      output: 'mc_var_get',
      extensions: ['mc_scoreboard_variable_dropdown'],
    },
    generator(block) {
      const name = block.getField(FIELD_VAR_NAME)!.getText()
      return [scoreboardManager.getVarName(name), 0]
    },
  },
]
