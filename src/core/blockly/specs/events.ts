import type { BlockSpec } from './types'

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
    generator() {
      return ''
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
    generator() {
      return ''
    },
  },
]
