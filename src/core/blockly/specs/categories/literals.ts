import type { BlockSpec } from '../types'
import * as Blockly from 'blockly'
import {setShadowState} from "../../extensions/shadows.ts"
import {colours} from '../../colours.ts'
import {bindExtraState, mutateExtraState, type StatefulBlock} from '../extraState.ts'
import {
  LiteralRotationNode,
  LiteralIntNode,
  LiteralPositionNode,
  LiteralRangeNode,
  LiteralStringNode,
  valueToIr, TildeCaretNode
} from '../../../compiler'

const FIELD_VALUE = 'VALUE'
const FIELD_PREFIX = 'PREFIX'

type TildeCaretPrefix = '~' | '^' | null
type TildeCaretBlockStates = {
  prefix: TildeCaretPrefix
}
type TildeCaretBlock = StatefulBlock & TildeCaretBlockStates

function updateTildeCaretWarning(block: TildeCaretBlock) {
  const valueBlock = block.getInput(FIELD_VALUE)?.connection?.targetBlock()
  const hasEmptyUnprefixedOptNumber = block.prefix === null
    && valueBlock?.type === 'opt_number'
    && valueBlock.getFieldValue(FIELD_VALUE) === ''

  block.setWarningText(hasEmptyUnprefixedOptNumber ? 'Missing value' : null)
}

function setTildeCaretPrefix(block: TildeCaretBlock, prefix: TildeCaretPrefix) {
  mutateExtraState(block, () => {
    block.prefix = prefix
  })
  block.updateShape_?.()
}

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
    type: 'tilde_caret',
    category: 'literals',
    init(this: Blockly.Block) {
      const block = this as TildeCaretBlock
      bindExtraState<TildeCaretBlock, TildeCaretBlockStates>(block, {
        prefix: '~',
      })

      block.updateShape_ = function(this: TildeCaretBlock) {
        const input = this.getInput(FIELD_VALUE) ?? this.appendValueInput(FIELD_VALUE)
          .setCheck(['opt_number', 'mc_proc_param'])
        const prefixField = this.getField(FIELD_PREFIX)

        if (this.prefix === null) {
          if (prefixField) input.removeField(FIELD_PREFIX)
          updateTildeCaretWarning(this)
          return
        }

        if (prefixField) {
          prefixField.setValue(this.prefix)
          updateTildeCaretWarning(this)
          return
        }

        input.appendField(this.prefix, FIELD_PREFIX)
        updateTildeCaretWarning(this)
      }

      block.onchange = function(this: TildeCaretBlock) {
        updateTildeCaretWarning(this)
      }

      block.setColour(colours.literals)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setOutput(true, 'tilde_caret')

      block.updateShape_()
    },
    generator(block) {
      return new TildeCaretNode((block as TildeCaretBlock).prefix, valueToIr(block, FIELD_VALUE), block.id)
    },
    setShadowBlocks(this) {
      setShadowState(this, FIELD_VALUE, {type: 'opt_number'})
    },
    contextMenu(options) {
      const block = this as TildeCaretBlock
      const scope = {block}

      options.push(
        {
          text: 'make ^',
          enabled: true,
          scope,
          weight: 0,
          callback: () => setTildeCaretPrefix(block, '^'),
        },
        {
          text: 'make ~',
          enabled: true,
          scope,
          weight: 1,
          callback: () => setTildeCaretPrefix(block, '~'),
        },
        {
          text: 'clear prefix',
          enabled: true,
          scope,
          weight: 2,
          callback: () => setTildeCaretPrefix(block, null),
        },
      )
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
          check: ['mc_proc_param', 'tilde_caret']
        },
        {
          type: 'input_value',
          name: 'Y',
          check: ['mc_proc_param', 'tilde_caret']
        },
        {
          type: 'input_value',
          name: 'Z',
          check: ['mc_proc_param', 'tilde_caret']
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
    json: {
      type: 'mc_rotation',
      message0: 'yaw%1 pitch%2',
      args0: [
        {
          type: 'input_value',
          name: 'YAW',
          check: ['mc_proc_param', 'angle']
        },
        {
          type: 'input_value',
          name: 'PITCH',
          check: ['mc_proc_param', 'angle']
        },
      ],
      output: 'mc_rotation',
      inputsInline: true,
    },
    generator(block) {
      return new LiteralRotationNode(
        valueToIr(block, 'YAW'),
        valueToIr(block, 'PITCH'),
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, 'YAW', {type: 'angle'})
      setShadowState(this, 'PITCH', {type: 'angle'})
    }
  },
]
