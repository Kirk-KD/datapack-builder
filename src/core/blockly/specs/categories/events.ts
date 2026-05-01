import type { BlockSpec } from '../types'
import {OnLoadNode, OnTickNode} from '../../../compiler/ir'
import {nextBlocksToIr} from '../../../compiler/generator'

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
        nextBlocksToIr(block),
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
        nextBlocksToIr(block),
        block.id
      )
    }
  },
]
