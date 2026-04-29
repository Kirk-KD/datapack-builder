import * as Blockly from 'blockly'
import getControlCategory from './categories/control'
import {colours} from './colours'
import { getBlockTypesByCategory } from './specs/blockRegistry'
import getVariablesCategory from "./categories/variables.ts"

export default function getToolboxContents(workspace?: Blockly.WorkspaceSvg) {
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
      contents: getControlCategory(workspace)
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
      contents: getVariablesCategory()
    },
    {
      kind: "category",
      name: "Procedures",
      custom: "PROCEDURE",
      colour: colours.procedures
    },
    {
      kind: 'category',
      name: 'Execute',
      colour: colours.execute,
      contents: getBlockTypesByCategory('execute').map(type => ({ kind: 'block', type }))
    },
  ]
}