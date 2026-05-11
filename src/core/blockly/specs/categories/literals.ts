import type { BlockSpec } from '../types'
import * as Blockly from 'blockly'
import {setShadowState} from "../../extensions/shadows.ts"
import {colours} from '../../colours.ts'
import {
  LiteralRotationNode,
  LiteralIntNode,
  LiteralPositionNode,
  LiteralRangeNode,
  LiteralStringNode,
  valueToIr, TildeNode, CaretNode
} from '../../../compiler'

const FIELD_VALUE = 'VALUE'
const FIELD_PREFIX = 'PREFIX'

const ROTATION_YAW_INPUT = 'YAW'
const ROTATION_PITCH_INPUT = 'PITCH'

export const literalBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_int',
    category: 'literals',
    tags: ['literal', 'scoreboardVarSet', 'procArg'],
    json: {
      type: 'mc_int',
      tooltip: '',
      helpUrl: '',
      message0: 'int %1',
      args0: [
        {
          type: 'field_number',
          name: FIELD_VALUE,
          value: 0,
        },
      ],
      output: 'mc_int',
      extensions: ['mc_int_validator'],
    },
    generator(block) {
      return new LiteralIntNode(block.getFieldValue(FIELD_VALUE), block.id)
    },
  },
  {
    type: 'mc_string',
    category: 'literals',
    tags: ['literal', 'procArg'],
    json: {
      type: 'mc_string',
      tooltip: '',
      helpUrl: '',
      message0: '%1',
      args0: [
        {
          type: 'field_input',
          name: FIELD_VALUE,
          text: 'Hello world',
        },
      ],
      output: 'mc_string',
    },
    generator(block) {
      return new LiteralStringNode(block.getFieldValue(FIELD_VALUE), block.id)
    },
  },
  {
    type: 'tilde',
    category: 'literals',
    init(this: Blockly.Block) {
      this.appendValueInput(FIELD_VALUE)
        .setCheck(['opt_number', 'mc_proc_param'])
        .appendField('~', FIELD_PREFIX)

      this.setColour(colours.literals)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(true)
      this.setOutput(true, 'tilde')
    },
    generator(block) {
      return new TildeNode(valueToIr(block, FIELD_VALUE), block.id)
    },
    setShadowBlocks(this) {
      setShadowState(this, FIELD_VALUE, {type: 'opt_number'})
    },
  },
  {
    type: 'caret',
    category: 'literals',
    init(this: Blockly.Block) {
      this.appendValueInput(FIELD_VALUE)
        .setCheck(['opt_number', 'mc_proc_param'])
        .appendField('^', FIELD_PREFIX)

      this.setColour(colours.literals)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(true)
      this.setOutput(true, 'caret')
    },
    generator(block) {
      return new CaretNode(valueToIr(block, FIELD_VALUE), block.id)
    },
    setShadowBlocks(this) {
      setShadowState(this, FIELD_VALUE, {type: 'opt_number'})
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
          // Right now proc param is always int; might need to change in the future
          check: ['mc_proc_param', 'number', 'tilde', 'caret']
        },
        {
          type: 'input_value',
          name: 'Y',
          check: ['mc_proc_param', 'number', 'tilde', 'caret']
        },
        {
          type: 'input_value',
          name: 'Z',
          check: ['mc_proc_param', 'number', 'tilde', 'caret']
        },
      ],
      output: 'mc_block_pos',
      inputsInline: true,
    },
    generator(block) {
      return new LiteralPositionNode(
        valueToIr(block, 'X'),
        valueToIr(block, 'Y'),
        valueToIr(block, 'Z'),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, 'X', {type: 'number'})
      setShadowState(this, 'Y', {type: 'number'})
      setShadowState(this, 'Z', {type: 'number'})
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
          check: ['mc_proc_param', 'number']
        },
        {
          type: 'input_value',
          name: 'MAX',
          check: ['mc_proc_param', 'number']
        },
      ],
      output: 'mc_range',
      inputsInline: true,
    },
    generator(block) {
      return new LiteralRangeNode(
        valueToIr(block, 'MIN'),
        valueToIr(block, 'MAX'),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, 'MIN', {type: 'number', fields: { VALUE: '' }})
      setShadowState(this, 'MAX', {type: 'number', fields: { VALUE: '' }})
    }
  },
  {
    type: 'mc_rotation',
    category: 'literals',
    init(this: Blockly.Block) {
      this.appendValueInput(ROTATION_YAW_INPUT)
        .setCheck(['mc_proc_param', 'number', 'tilde'])
        .appendField('yaw')
      this.appendValueInput(ROTATION_PITCH_INPUT)
        .setCheck(['mc_proc_param', 'number', 'tilde'])
        .appendField('pitch')

      this.setColour(colours.literals)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(true)
      this.setOutput(true, 'mc_rotation')
    },
    generator(block) {
      return new LiteralRotationNode(
        valueToIr(block, ROTATION_YAW_INPUT),
        valueToIr(block, ROTATION_PITCH_INPUT),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, ROTATION_YAW_INPUT, {type: 'number'})
      setShadowState(this, ROTATION_PITCH_INPUT, {type: 'number'})
    }
  },
]
