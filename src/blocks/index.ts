import * as Blockly from 'blockly'
import definitionsJson from './definitions.json'
import getControlCategory from './categories/control'

const { commands, control, variable, events } = definitionsJson as {
  commands: { type: string }[]
  control: { type: string }[]
  variable: { type: string }[]
  events: { type: string }[]
}

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
      colour: '30',
      contents: events.map(block => ({ kind: 'block', type: block.type }))
    },
    {
      kind: 'category',
      name: 'Variables',
      custom: 'MC_VARIABLES',
      colour: '290'
    },
    {
      kind: 'category',
      name: 'Commands',
      colour: '160',
      contents: commands.map(block => ({ kind: 'block', type: block.type }))
    },
    {
      kind: 'category',
      name: 'Control',
      colour: '210',
      contents: getControlCategory(workspace)
    },
    {
      kind: 'category',
      name: 'Literals',
      colour: '65',
      contents: builtinBlocks.map(type => ({ kind: 'block', type }))
    },
    {
      kind: "category",
      name: "Procedures",
      custom: "PROCEDURE",
      colour: '100'
    }
  ]
}