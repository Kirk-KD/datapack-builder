import type {BlockSpec} from '../types.ts'
import * as Blockly from 'blockly'
import {valueTypes} from '../valueTypes.ts'
import {type BinaryOperator, BinOpNode, LiteralIntNode, valueToIr} from '../../../compiler'
import {colours} from '../../colours.ts'

const BINARY_OPERAND_CHECKS = [valueTypes.VarGet, valueTypes.Int]
const BINARY_INPUT_A = 'A'
const BINARY_INPUT_B = 'B'

function getInputType(block: Blockly.Block, inputName: string) {
  const targetBlock = block.getInputTargetBlock(inputName)
  return targetBlock?.outputConnection?.getCheck()?.[0]
}

/**
 * var + var -> var
 *
 * var + const -> var
 *
 * const + const -> const
 */
function updateBinaryOutputType(block: Blockly.Block) {
  const inputAType = getInputType(block, BINARY_INPUT_A)
  const inputBType = getInputType(block, BINARY_INPUT_B)

  if (!inputAType || !inputBType) {
    block.setOutput(true, BINARY_OPERAND_CHECKS)
    return
  }

  if (inputAType === valueTypes.Int && inputBType === valueTypes.Int) {
    block.setOutput(true, valueTypes.Int)
    return
  }

  block.setOutput(true, valueTypes.VarGet)
}

/**
 * Create a binary math operation block.
 */
function makeBinaryOperationBlockSpec(type: string, op: BinaryOperator): BlockSpec {
  return {
    type,
    category: 'math',
    init(this: Blockly.Block) {
      this.setColour(colours.math)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(true)

      this.appendValueInput(BINARY_INPUT_A)
        .setCheck(BINARY_OPERAND_CHECKS)

      this.appendValueInput(BINARY_INPUT_B)
        .setCheck(BINARY_OPERAND_CHECKS)
        .appendField(op)

      updateBinaryOutputType(this)
      this.setOnChange(function(this: Blockly.Block) {
        updateBinaryOutputType(this)
      })
    },
    generator(block: Blockly.Block) {
      return new BinOpNode(
        valueToIr(block, BINARY_INPUT_A),
        op,
        valueToIr(block, BINARY_INPUT_B),
        block.id
      )
    }
  }
}

const intBlockSpec: BlockSpec = {
  type: valueTypes.Int,
  category: 'math',
  json: {
    type: valueTypes.Int,
    tooltip: '',
    helpUrl: '',
    message0: 'int %1',
    args0: [
      {
        type: 'field_number',
        name: 'VALUE',
        value: 0,
      },
    ],
    output: valueTypes.Int,
    extensions: ['mc_int_validator'],
  },
  generator(block) {
    return new LiteralIntNode(block.getFieldValue('VALUE'), block.id)
  },
}

const addBlockSpec: BlockSpec = makeBinaryOperationBlockSpec('add', '+')
const subBlockSpec: BlockSpec = makeBinaryOperationBlockSpec('sub', '-')
const mulBlockSpec: BlockSpec = makeBinaryOperationBlockSpec('mul', '*')
const divBlockSpec: BlockSpec = makeBinaryOperationBlockSpec('div', '/')
const modBlockSpec: BlockSpec = makeBinaryOperationBlockSpec('mod', 'mod')

export const mathBlockSpecs: BlockSpec[] = [
  intBlockSpec,
  addBlockSpec,
  subBlockSpec,
  mulBlockSpec,
  divBlockSpec,
  modBlockSpec,
]
