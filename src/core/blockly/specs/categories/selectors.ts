// TODO switch to editor system

import type {BlockSpec} from '../types.ts'
import * as Blockly from 'blockly'
import {valueToIr, LiteralStringNode, TargetSelectorNode} from '../../../compiler'
import {colours} from '../../colours.ts'
import {setShadowState} from '../../extensions/shadows.ts'

export const selectorBlockSpecs: BlockSpec[] = [
  { // PLACEHOLDER
    type: 'mc_target_selector',
    json: {
      type: 'mc_target_selector',
      colour: colours.constructs,
      message0: '%1',
      args0: [
        {
          type: 'input_value',
          name: 'INPUT',
          check: ['mc_string'],
        }
      ],
      output: 'mc_target_selector',
      inputsInline: true
    },
    generator(block: Blockly.Block) {
      return new TargetSelectorNode((valueToIr(block, 'INPUT') as LiteralStringNode).value, [], block.id)
    },
    setShadowBlocks(this) {
      setShadowState(this, 'INPUT', { type: 'mc_string', fields: { 'VALUE': '@s' } })
    }
  }
]