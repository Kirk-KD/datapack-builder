import { literalChain } from '../../compiler/util'
import type { BlockSpec } from './types'
import { mcfunctionGenerator } from '../../compiler/generator'
import {setShadowState} from "../extensions/shadows.ts";

const FIELD_VALUE = 'VALUE'
const INPUT_CHAIN_NEXT = 'CHAIN_NEXT'
const chainableChecks = ['mc_string', 'mc_int', 'mc_param', 'mc_target_selector']

export const literalBlockSpecs: BlockSpec[] = [
  { // TODO remove
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
  { // TODO make shadow input
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
  {
    type: 'mc_block_pos',
    category: 'literals',
    json: {
      type: 'mc_block_pos',
      message0: 'x%1 y%2 z%3',
      args0: [
        {
          type: 'input_value',
          name: 'X',
          check: ['mc_param', 'tilde_caret']
        },
        {
          type: 'input_value',
          name: 'Y',
          check: ['mc_param', 'tilde_caret']
        },
        {
          type: 'input_value',
          name: 'Z',
          check: ['mc_param', 'tilde_caret']
        },
      ],
      output: 'mc_block_pos',
      inputsInline: true,
    },
    generator(block) {
      const x = mcfunctionGenerator.valueToCode(block, 'X', 0)
      const y = mcfunctionGenerator.valueToCode(block, 'Y', 0)
      const z = mcfunctionGenerator.valueToCode(block, 'Z', 0)
      return [`${x} ${y} ${z}`, 0]
    },
    setShadowBlocks(this) {
      setShadowState(this, 'X', {type: 'tilde_caret'})
      setShadowState(this, 'Y', {type: 'tilde_caret'})
      setShadowState(this, 'Z', {type: 'tilde_caret'})
    }
  },
  {
    type: 'mc_range',
    category: 'literals',
    json: {
      type: 'mc_range',
      message0: '%1..%2',
      args0: [
        {
          type: 'input_value',
          name: 'MIN',
          check: ['mc_param', 'number']
        },
        {
          type: 'input_value',
          name: 'MAX',
          check: ['mc_param', 'number']
        },
      ],
      output: 'mc_range',
      inputsInline: true,
    },
    generator(block) {
      const min = mcfunctionGenerator.valueToCode(block, 'MIN', 0)
      const max = mcfunctionGenerator.valueToCode(block, 'MAX', 0)
      return [`${min}..${max}`, 0]
    },
    setShadowBlocks(this) {
      setShadowState(this, 'MIN', {type: 'number'})
      setShadowState(this, 'MAX', {type: 'number'})
    }
  },
  {
    type: 'mc_rotation',
    category: 'literals',
    json: {
      type: 'mc_rotation',
      message0: 'yaw%1 pitch%2',
      args0: [
        {
          type: 'input_value',
          name: 'YAW',
          check: ['mc_param', 'angle']
        },
        {
          type: 'input_value',
          name: 'PITCH',
          check: ['mc_param', 'angle']
        },
      ],
      output: 'mc_rotation',
      inputsInline: true,
    },
    generator(block) {
      const yaw = mcfunctionGenerator.valueToCode(block, 'YAW', 0)
      const pitch = mcfunctionGenerator.valueToCode(block, 'PITCH', 0)
      return [`${yaw} ${pitch}`, 0]
    },
    setShadowBlocks(this) {
      setShadowState(this, 'YAW', {type: 'angle'})
      setShadowState(this, 'PITCH', {type: 'angle'})
    }
  },
]
