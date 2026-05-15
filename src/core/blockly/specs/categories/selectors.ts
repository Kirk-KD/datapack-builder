// TODO switch to editor system

import type {BlockSpec} from '../types.ts'
import * as Blockly from 'blockly'
import {valueToIr, LiteralStringNode, TargetSelectorNode} from '../../../compiler'
import {colours} from '../../colours.ts'
import {setShadowState} from '../../extensions/shadows.ts'
import {valueTypes} from '../valueTypes'

export const selectorBlockSpecs: BlockSpec[] = [
  { // PLACEHOLDER
    type: valueTypes.TargetSelector,
    json: {
      type: valueTypes.TargetSelector,
      colour: colours.constructs,
      message0: '%1',
      args0: [
        {
          type: 'input_value',
          name: 'INPUT',
          check: [valueTypes.String],
        }
      ],
      output: valueTypes.TargetSelector,
      inputsInline: true
    },
    generator(block: Blockly.Block) {
      return new TargetSelectorNode((valueToIr(block, 'INPUT') as LiteralStringNode).value, [], block.id)
    },
    setShadowBlocks(this) {
      setShadowState(this, 'INPUT', { type: valueTypes.String, fields: { 'VALUE': '@s' } })
    }
  }
]