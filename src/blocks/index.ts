import * as Blockly from 'blockly'
import definitionsJson from './definitions.json'
import getControlCategory from './categories/control'
import { colours } from './blockColours'

const { commands, control, variable, events } = definitionsJson as unknown as {
  commands: { type: string, colour: string }[]
  control: { type: string, colour: string }[]
  variable: { type: string, colour: string }[]
  events: { type: string, colour: string }[]
}

commands.forEach(b => {b['colour'] = colours.commands})
control.forEach(b => {b['colour'] = colours.control})
variable.forEach(b => {b['colour'] = colours.variable})
events.forEach(b => {b['colour'] = colours.events})

Blockly.defineBlocksWithJsonArray(commands)
Blockly.defineBlocksWithJsonArray(control)
Blockly.defineBlocksWithJsonArray(variable)
Blockly.defineBlocksWithJsonArray(events)

const builtinBlocks: string[] = [
  'math_number'
]

export default function getToolboxContents(workspace?: Blockly.WorkspaceSvg) {
  return [
    {
      kind: 'category',
      name: 'Events',
      colour: colours.events,
      contents: events.map(block => ({ kind: 'block', type: block.type }))
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
      contents: commands.map(block => ({ kind: 'block', type: block.type }))
    },
    {
      kind: 'category',
      name: 'Literals',
      colour: colours.literals,
      contents: builtinBlocks.map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Variables',
      custom: 'MC_VARIABLES',
      colour: colours.variable
    },
    {
      kind: "category",
      name: "Procedures",
      custom: "PROCEDURE",
      colour: colours.procedures
    }
  ]
}