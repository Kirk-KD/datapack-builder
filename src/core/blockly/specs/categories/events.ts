import type { BlockSpec } from '../types'
import {
  CommandNode,
  OnLoadNode,
  OnTickNode,
  nextBlocksToIr,
  OnPlayerMinesBlockNode,
  valueToIr,
  LiteralStringNode
} from '../../../compiler'
import {setShadowState} from '../../extensions/shadows.ts'

export const eventBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_on_load',
    category: 'events',
    json: {
      type: 'mc_on_load',
      message0: 'on load',
      args0: [],
      nextStatement: null,
    },
    generator(block) {
      return new OnLoadNode(
        nextBlocksToIr(block) as CommandNode[],
        block.id
      )
    },
  },
  {
    type: 'mc_on_tick',
    category: 'events',
    json: {
      type: 'mc_on_tick',
      message0: 'every tick',
      args0: [],
      nextStatement: null,
    },
    generator(block) {
      return new OnTickNode(
        nextBlocksToIr(block) as CommandNode[],
        block.id
      )
    }
  },
  {
    type: 'mc_on_player_mined_block',
    category: 'events',
    json: {
      type: 'mc_on_player_mined_block',
      message0: 'when a player mines %1',
      args0: [
        {
          type: 'input_value',
          name: 'BLOCK',
          check: ['mc_string'],
        },
      ],
      inputsInline: true,
      nextStatement: null
    },
    generator(block) {
      return new OnPlayerMinesBlockNode(
        valueToIr(block, 'BLOCK') as LiteralStringNode,
        nextBlocksToIr(block) as CommandNode[],
        block.id
      )
    },
    setShadowBlocks(this) {
      setShadowState(this, 'BLOCK', { type: 'mc_string', fields: { VALUE: 'stone' } })
    }
  }
]
