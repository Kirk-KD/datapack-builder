import * as Blockly from 'blockly'
import { commands, control, variable, events, literals, procedures } from './definitions'
import getControlCategory from './categories/control'
import { colours } from './blockColours'
import './extensions'
import './validators'

commands.forEach(b => {b['colour'] = colours.commands})
control.forEach(b => {b['colour'] = colours.control})
variable.forEach(b => {b['colour'] = colours.variable})
events.forEach(b => {b['colour'] = colours.events})
literals.forEach(b => {b['colour'] = colours.literals})
procedures.forEach(b => {b['colour'] = colours.procedures})

Blockly.defineBlocksWithJsonArray(commands)
Blockly.defineBlocksWithJsonArray(control)
Blockly.defineBlocksWithJsonArray(variable)
Blockly.defineBlocksWithJsonArray(events)
Blockly.defineBlocksWithJsonArray(literals)
Blockly.defineBlocksWithJsonArray(procedures)

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
      contents: literals.map(block => ({ kind: 'block', type: block.type }))
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