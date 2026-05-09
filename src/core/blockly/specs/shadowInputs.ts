import * as Blockly from 'blockly'
import type { BlockSpec, ShadowInputBlockValidatorFunction } from './types'
import {type IrGeneratorFunction, LiteralIntNode, LiteralStringNode} from '../../compiler'

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

function validateTilde(input: string) {
  return /^~(?:-?\d*(?:\.\d+)?)?$/.test(input) ? input : null
}

function validateCaret(input: string) {
  return /^\^(?:-?\d*(?:\.\d+)?)?$/.test(input) ? input : null
}

export const shadowInputBlockSpecs: BlockSpec[] = [
  makeShadowInputBlockSpec(
    'number',
    input => {
      if (input === '') return input
      return validateNumber(input)
    },
    function(block: Blockly.Block) {
      return new LiteralIntNode(Number(block.getFieldValue(INPUT_VALUE))) // TODO placeholder
    },
    '0'
  ),
  makeShadowInputBlockSpec(
  'tilde_caret',
    input => {
      if (input === '') return input
      return validateNumber(input) ?? validateTilde(input) ?? validateCaret(input)
    },
    function(block: Blockly.Block) {
      return new LiteralStringNode(block.getFieldValue(INPUT_VALUE))
    },
    '~'
  ),
  // makeShadowInputBlockSpec('tilde',
  //   input => {
  //     if (input === '') return input
  //     return validateNumber(input) ?? validateTilde(input)
  //   },
  //   function(block: Blockly.Block) {
  //     return new LiteralStringNode(block.getFieldValue(INPUT_VALUE))
  //   },
  //   '~'
  // ),
  makeShadowInputBlockSpec('swizzle',
    input => {
      if (input === '') return input
      return /^(?!.*(.).*\1)[xyz]{1,3}$/.test(input) ? input : null
    },
    function(block: Blockly.Block) {
      return new LiteralStringNode(block.getFieldValue(INPUT_VALUE))
    },
    'xyz'
  ),
  makeShadowInputBlockSpec('angle',
    input => {
      if (input === '') return input
      return validateNumber(input) ?? validateTilde(input)
    },
    function(block: Blockly.Block) {
      return new LiteralStringNode(block.getFieldValue(INPUT_VALUE))
    },
    '~'
  )
]
