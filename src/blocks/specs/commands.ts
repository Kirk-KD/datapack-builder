import { mcfunctionGenerator } from '../../compiler/generator'
import { literalChain } from '../../compiler/util'
import type { BlockSpec } from './types'
import {setShadowState} from "../extensions/shadows.ts";

const chainableChecks = ['mc_string', 'mc_int', 'mc_param', 'mc_target_selector']

export const commandBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_say',
    category: 'commands',
    json: {
      type: 'mc_say',
      message0: 'say %1',
      args0: [
        {
          type: 'input_value',
          name: 'MESSAGE',
          check: chainableChecks,
        },
      ],
      inputsInline: true,
      tooltip: 'Broadcasts a message to all players',
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      const msgBlock = block.getInputTargetBlock('MESSAGE')!
      const [msg, hasMacro] = literalChain(msgBlock)
      return (hasMacro ? '$' : '') + `say ${msg}\n`
    },
    setShadowBlocks(this) {
      setShadowState(this, 'MESSAGE', {
        type: 'mc_string',
        fields: { VALUE: 'Hello world' },
      })
    },
  },
  {
    type: 'mc_teleport',
    category: 'commands',
    json: {
      type: 'mc_teleport',
      message0: 'teleport %1 to %2',
      args0: [
        {
          type: 'input_value',
          name: 'SELECTOR',
          check: ['mc_string', 'mc_target_selector'],
        },
        {
          type: 'input_value',
          name: 'TARGET',
          check: ['mc_param', 'mc_block_pos']
        }
      ],
      inputsInline: true,
      tooltip: 'Teleports to coordinates',
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      const selector = mcfunctionGenerator.valueToCode(block, 'SELECTOR', 0)
      const target = mcfunctionGenerator.valueToCode(block, 'TARGET', 0)
      return `teleport ${selector} ${target}\n`
    },
    setShadowBlocks(this) {
      setShadowState(this, 'SELECTOR', { type: 'mc_target_selector' })
      setShadowState(this, 'TARGET', { type: 'mc_block_pos' })
    },
  },
]
