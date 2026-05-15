import {colours} from './colours'
import { getBlockTypesByCategory } from './specs/blockRegistry'
import {getProcCallBlocks} from "./specs/categories/procedures.ts";
import {getConstantBlocks} from './specs/categories/constants.ts';
import * as Blockly from 'blockly'

export default function getToolboxContents(workspace?: Blockly.Workspace) {
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
      name: 'Utility',
      colour: colours.utility,
      contents: getBlockTypesByCategory('utility').map(type => ({ kind: 'block', type }))
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
      name: 'Math',
      colour: colours.literals,
      contents: getBlockTypesByCategory('math').map(type => ({ kind: 'block', type }))
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
      kind: 'category',
      name: 'Constants',
      colour: colours.constants,
      contents: [
        {
          kind: 'button',
          text: 'Create constant',
          callbackKey: 'CREATE_CONSTANT'
        },
        ...getConstantBlocks(workspace)
      ]
    },
    {
      kind: 'category',
      name: 'Arrays',
      colour: colours.array,
      contents: getBlockTypesByCategory('array').map(type => ({ kind: 'block', type }))
    },
    {
      kind: "category",
      name: "Procedures",
      colour: colours.procedures,
      contents: [
        {
          kind: 'button',
          text: 'Create procedure',
          callbackKey: 'CREATE_PROCEDURE'
        },
        ...getProcCallBlocks()
      ]
    },
    {
      kind: 'category',
      name: 'Execute',
      colour: colours.execute,
      contents: getBlockTypesByCategory('execute').map(type => ({ kind: 'block', type }))
    },
  ]
}
