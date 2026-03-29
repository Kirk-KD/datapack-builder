import { mcfunctionGenerator } from '../../compiler/generator'
import { literalChain } from '../../compiler/util'
import type { BlockSpec } from './types'

const INPUT_MESSAGE = 'MESSAGE'
const INPUT_SELECTOR = 'SELECTOR'
const FIELD_X = 'X'
const FIELD_Y = 'Y'
const FIELD_Z = 'Z'
const chainableChecks = ['mc_string', 'mc_int', 'mc_param', 'mc_target_selector']

export const commandBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_say',
    category: 'commands',
    codeKind: 'command',
    extensions: ['mc_say_shadow'],
    json: {
      type: 'mc_say',
      message0: 'say %1',
      args0: [
        {
          type: 'input_value',
          name: INPUT_MESSAGE,
          check: chainableChecks,
        },
      ],
      inputsInline: true,
      tooltip: 'Broadcasts a message to all players',
      previousStatement: null,
      nextStatement: null,
      extensions: ['mc_say_shadow'],
    },
    generator(block) {
      const msgBlock = block.getInputTargetBlock(INPUT_MESSAGE)!
      const [msg, hasMacro] = literalChain(msgBlock)
      return (hasMacro ? '$' : '') + `say ${msg}\n`
    },
  },
  {
    type: 'mc_teleport',
    category: 'commands',
    codeKind: 'command',
    extensions: ['mc_teleport_shadow'],
    json: {
      type: 'mc_teleport',
      message0: 'teleport %1 to %2 %3 %4',
      args0: [
        {
          type: 'input_value',
          name: INPUT_SELECTOR,
          check: ['mc_string', 'mc_target_selector'],
        },
        {
          type: 'field_input',
          name: FIELD_X,
          text: '0',
        },
        {
          type: 'field_input',
          name: FIELD_Y,
          text: '0',
        },
        {
          type: 'field_input',
          name: FIELD_Z,
          text: '0',
        },
      ],
      inputsInline: true,
      tooltip: 'Teleports to coordinates',
      previousStatement: null,
      nextStatement: null,
      extensions: ['mc_teleport_shadow'],
    },
    generator(block) {
      const selector = mcfunctionGenerator.valueToCode(block, INPUT_SELECTOR, 0) || ''
      const x = block.getFieldValue(FIELD_X)
      const y = block.getFieldValue(FIELD_Y)
      const z = block.getFieldValue(FIELD_Z)
      return `teleport ${selector.trim()} ${x} ${y} ${z}\n`
    },
  },
]
