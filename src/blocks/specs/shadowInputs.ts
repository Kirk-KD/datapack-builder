import * as Blockly from 'blockly'
import type { BlockGeneratorFunction, BlockSpec, ShadowInputBlockValidatorFunction } from './types'

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
function makeShadowInputBlockSpec(type: string, validator: ShadowInputBlockValidatorFunction, generator?: BlockGeneratorFunction): BlockSpec {
  registerValidatorExtension(type, validator)
  return {
    type,
    json: {
      type,
      tooltip: '',
      helpUrl: '',
      message0: '%1',
      args0: [
        {
          type: 'field_input',
          name: INPUT_VALUE,
        },
      ],
      output: type,
      extensions: [getValidatorExtensionName(type)],
    },
    generator: generator ?? (block => block.getFieldValue(INPUT_VALUE)),
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
  makeShadowInputBlockSpec('number', input => {
    if (input === '') return input
    return validateNumber(input)
  }),
  makeShadowInputBlockSpec('tilde_caret', input => {
    if (input === '') return input
    return validateTilde(input) ?? validateCaret(input)
  }),
  makeShadowInputBlockSpec('tilde', input => {
    if (input === '') return input
    return validateTilde(input)
  }),
  makeShadowInputBlockSpec('swizzle', input => {
    if (input === '') return input
    return /^(?!.*(.).*\1)[xyz]{1,3}$/.test(input) ? input : null
  }),
  makeShadowInputBlockSpec('angle', input => {
    if (input === '') return input
    return validateTilde(input)
  })
]
