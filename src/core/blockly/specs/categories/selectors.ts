// TODO switch to editor system

import type {BlockSpec} from '../types.ts'
import * as Blockly from 'blockly'
import {TargetSelectorNode} from '../../../compiler/ir'

export const selectorBlockSpecs: BlockSpec[] = [
  { // PLACEHOLDER
    type: 'mc_target_selector',
    json: {
      type: 'mc_target_selector',
      message0: '%1',
      args0: [
        {
          type: 'input_value',
          name: 'INPUT',
          check: ['string'],
        }
      ],
      output: 'mc_target_selector',
      inputsInline: true
    },
    generator(block: Blockly.Block) {
      return new TargetSelectorNode('@s', [], block.id)
    }
  }
]