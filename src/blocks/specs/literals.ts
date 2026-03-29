import { literalChain } from '../../compiler/util'
import type { BlockSpec } from './types'

const FIELD_VALUE = 'VALUE'
const INPUT_CHAIN_NEXT = 'CHAIN_NEXT'
const chainableChecks = ['mc_string', 'mc_int', 'mc_param', 'mc_target_selector']

export const literalBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_int',
    category: 'literals',
    tags: ['chainable', 'literal', 'scoreboardVarSet', 'procArg'],
    json: {
      type: 'mc_int',
      tooltip: '',
      helpUrl: '',
      message0: 'int %1 %2',
      args0: [
        {
          type: 'field_number',
          name: FIELD_VALUE,
          value: 0,
        },
        {
          type: 'input_value',
          name: INPUT_CHAIN_NEXT,
          check: chainableChecks,
        },
      ],
      output: 'mc_int',
      extensions: ['mc_trim_chain_tail', 'mc_int_validator'],
    },
    generator(block) {
      const [text] = literalChain(block)
      return [text, 0]
    },
  },
  {
    type: 'mc_string',
    category: 'literals',
    tags: ['chainable', 'literal', 'procArg'],
    json: {
      type: 'mc_string',
      tooltip: '',
      helpUrl: '',
      message0: '%1 %2',
      args0: [
        {
          type: 'field_input',
          name: FIELD_VALUE,
          text: 'Hello world',
        },
        {
          type: 'input_value',
          name: INPUT_CHAIN_NEXT,
          check: chainableChecks,
        },
      ],
      output: 'mc_string',
      extensions: ['mc_trim_chain_tail'],
    },
    generator(block) {
      const [text] = literalChain(block)
      return [text, 0]
    },
  },
]
