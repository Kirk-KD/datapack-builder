import {colours} from './colours'
import { getBlockTypesByCategory } from './specs/blockRegistry'

export default function getToolboxContents() {
  return [
    {
      kind: 'category',
      name: 'Events',
      colour: colours.events,
      contents: getBlockTypesByCategory('events').map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Control',
      colour: colours.control,
      contents: getBlockTypesByCategory('control').map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Commands',
      colour: colours.commands,
      contents: getBlockTypesByCategory('commands').map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Literals',
      colour: colours.literals,
      contents: getBlockTypesByCategory('literals').map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Constructs',
      colour: colours.constructs,
      contents: getBlockTypesByCategory('constructs').map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: colours.variable,
      contents: [{
        kind: 'button',
        text: 'Create variable',
        callbackKey: 'CREATE_VARIABLE'
      }, ...getBlockTypesByCategory('variable').map(type => ({ kind: 'block', type }))]
    },
    {
      kind: "category",
      name: "Procedures",
      colour: colours.procedures,
      contents: getBlockTypesByCategory('procedures').map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Execute',
      colour: colours.execute,
      contents: getBlockTypesByCategory('execute').map(type => ({ kind: 'block', type }))
    },
  ]
}