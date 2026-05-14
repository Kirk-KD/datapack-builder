import type { BlockSpec } from '../types'
import * as Blockly from 'blockly'
import {setShadowState} from "../../extensions/shadows.ts"
import {colours} from '../../colours.ts'
import {valueTypes} from '../valueTypes'
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
    type: valueTypes.Int,
    category: 'literals',
    tags: ['literal', 'scoreboardVarSet', 'procArg'],
    json: {
      type: valueTypes.Int,
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
      output: valueTypes.Int,
      extensions: ['mc_int_validator'],
    },
    generator(block) {
      return new LiteralIntNode(block.getFieldValue(FIELD_VALUE), block.id)
    },
  },
  {
    type: valueTypes.String,
    category: 'literals',
    tags: ['literal', 'procArg'],
    json: {
      type: valueTypes.String,
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
      output: valueTypes.String,
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
        .setCheck([valueTypes.OptNumber, valueTypes.ProcParam, valueTypes.Int])
        .appendField('~', FIELD_PREFIX)

      this.setColour(colours.literals)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(true)
      this.setOutput(true, valueTypes.Tilde)
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
        .setCheck([valueTypes.OptNumber, valueTypes.ProcParam, valueTypes.Int])
        .appendField('^', FIELD_PREFIX)

      this.setColour(colours.literals)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(true)
      this.setOutput(true, valueTypes.Caret)
    },
    generator(block) {
      return new CaretNode(valueToIr(block, FIELD_VALUE), block.id)
    },
    setShadowBlocks(this) {
      setShadowState(this, FIELD_VALUE, {type: 'opt_number'})
    },
  },
  {
    type: valueTypes.Position,
    category: 'literals',
    json: {
      type: valueTypes.Position,
      message0: 'x%1 y%2 z%3',
      args0: [
        {
          type: 'input_value',
          name: 'X',
          // Right now proc param is always int; might need to change in the future
          check: [valueTypes.ProcParam, valueTypes.Number, valueTypes.Tilde, valueTypes.Caret, valueTypes.Int]
        },
        {
          type: 'input_value',
          name: 'Y',
          check: [valueTypes.ProcParam, valueTypes.Number, valueTypes.Tilde, valueTypes.Caret, valueTypes.Int]
        },
        {
          type: 'input_value',
          name: 'Z',
          check: [valueTypes.ProcParam, valueTypes.Number, valueTypes.Tilde, valueTypes.Caret, valueTypes.Int]
        },
      ],
      output: valueTypes.Position,
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
      setShadowState(this, 'X', {type: valueTypes.Number})
      setShadowState(this, 'Y', {type: valueTypes.Number})
      setShadowState(this, 'Z', {type: valueTypes.Number})
    }
  },
  {
    type: valueTypes.Range,
    category: 'literals',
    json: {
      type: valueTypes.Range,
      message0: '%1..%2',
      args0: [
        {
          type: 'input_value',
          name: 'MIN',
          check: [valueTypes.ProcParam, valueTypes.Number, valueTypes.Int]
        },
        {
          type: 'input_value',
          name: 'MAX',
          check: [valueTypes.ProcParam, valueTypes.Number, valueTypes.Int]
        },
      ],
      output: valueTypes.Range,
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
      setShadowState(this, 'MIN', {type: valueTypes.Number, fields: { VALUE: '' }})
      setShadowState(this, 'MAX', {type: valueTypes.Number, fields: { VALUE: '' }})
    }
  },
  {
    type: valueTypes.Rotation,
    category: 'literals',
    init(this: Blockly.Block) {
      this.appendValueInput(ROTATION_YAW_INPUT)
        .setCheck([valueTypes.ProcParam, valueTypes.Number, valueTypes.Tilde, valueTypes.Int])
        .appendField('yaw')
      this.appendValueInput(ROTATION_PITCH_INPUT)
        .setCheck([valueTypes.ProcParam, valueTypes.Number, valueTypes.Tilde, valueTypes.Int])
        .appendField('pitch')

      this.setColour(colours.literals)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(true)
      this.setOutput(true, valueTypes.Rotation)
    },
    generator(block) {
      return new LiteralRotationNode(
        valueToIr(block, ROTATION_YAW_INPUT),
        valueToIr(block, ROTATION_PITCH_INPUT),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, ROTATION_YAW_INPUT, {type: valueTypes.Number})
      setShadowState(this, ROTATION_PITCH_INPUT, {type: valueTypes.Number})
    }
  },
]
