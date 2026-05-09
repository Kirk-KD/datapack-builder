import * as Blockly from 'blockly'
import type { BlockSpec, ShadowInputBlockValidatorFunction } from './types'
import {type IrGeneratorFunction, LiteralStringNode, NumberNode, OptNumberNode} from '../../compiler'

const INPUT_VALUE = 'VALUE'

/**
 * Builds the registered extension name for a shadow input validator.
 */
function getValidatorExtensionName(type: string) {
  return `shadow_input_validator_${type}`
}

/**
 * Registers a Blockly extension that applies a validator to a shadow input block.
 */
function registerValidatorExtension(type: string, validator: ShadowInputBlockValidatorFunction) {
  Blockly.Extensions.register(getValidatorExtensionName(type), function(this: Blockly.Block) {
    this.getField(INPUT_VALUE)!.setValidator(validator)
  })
}

/**
 * Creates a standard single-field shadow input BlockSpec with an attached validator.
 */
function makeShadowInputBlockSpec(type: string, validator: ShadowInputBlockValidatorFunction, generator: IrGeneratorFunction, defaultValue?: string, message?: string): BlockSpec {
  registerValidatorExtension(type, validator)
  return {
    type,
    json: {
      type,
      tooltip: '',
      helpUrl: '',
      message0: message ?? '%1',
      args0: [
        {
          type: 'field_input',
          name: INPUT_VALUE,
          text: defaultValue
        },
      ],
      output: type,
      extensions: [getValidatorExtensionName(type)],
    },
    generator,
  }
}

function validateNumber(input: string) {
  return /^-?(?:\d+\.\d+|\d+|\.\d+|\d+\.)$/.test(input) ? input : null
}

export const shadowInputBlockSpecs: BlockSpec[] = [
  makeShadowInputBlockSpec(
    'number',
    input => {
      return validateNumber(input)
    },
    function(block: Blockly.Block) {
      return new NumberNode(Number(block.getFieldValue(INPUT_VALUE)), block.id)
    },
    '0'
  ),
  makeShadowInputBlockSpec(
    'opt_number',
    input => {
      if (input === '') return input
      return validateNumber(input)
    },
    function(block: Blockly.Block) {
      const value = block.getFieldValue(INPUT_VALUE)
      let n: number | null = value === '' ? null : Number(value)
      if (Number.isNaN(n)) n = null
      return new OptNumberNode(n, block.id)
    },
    ''
  ),
  makeShadowInputBlockSpec('swizzle',
    input => {
      if (input === '') return input
      return /^(?!.*(.).*\1)[xyz]{1,3}$/.test(input) ? input : null
    },
    function(block: Blockly.Block) {
      return new LiteralStringNode(block.getFieldValue(INPUT_VALUE), block.id)
    },
    'xyz'
  ),
  makeShadowInputBlockSpec('angle',
    input => {
      if (input === '') return input
      return validateNumber(input) ?? (/^~(?:-?\d*(?:\.\d+)?)?$/.test(input) ? input : null)
    },
    function(block: Blockly.Block) {
      return new LiteralStringNode(block.getFieldValue(INPUT_VALUE), block.id)
    },
    '~'
  )
]
