import * as Blockly from 'blockly'
import {
  commands,
  control,
  variable,
  events,
  literals,
  procedures,
  execute,
  targetSelectors,
  registerTargetSelectorBlock,
  targetSelectorRootType,
} from './definitions'
import getControlCategory from './categories/control'
import { colours } from './blockColours'
import './extensions'
import './validators'

type ColourableBlockDefinition = {
  type: string
  colour?: string
}

function applyColour(blocks: readonly ColourableBlockDefinition[], colour: string) {
  blocks.forEach(block => {
    block.colour = colour
  })
}

applyColour(commands, colours.commands)
applyColour(control, colours.control)
applyColour(variable, colours.variable)
applyColour(events, colours.events)
applyColour(literals, colours.literals)
applyColour(procedures, colours.procedures)
applyColour(execute, colours.execute)
applyColour(targetSelectors, colours.targetSelectors)

registerTargetSelectorBlock()
Blockly.defineBlocksWithJsonArray(commands)
Blockly.defineBlocksWithJsonArray(control)
Blockly.defineBlocksWithJsonArray(variable)
Blockly.defineBlocksWithJsonArray(events)
Blockly.defineBlocksWithJsonArray(literals)
Blockly.defineBlocksWithJsonArray(procedures)
Blockly.defineBlocksWithJsonArray(execute)
Blockly.defineBlocksWithJsonArray(targetSelectors)

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
    },
    {
      kind: 'category',
      name: 'Execute',
      colour: colours.execute,
      contents: execute.map(block => ({ kind: 'block', type: block.type }))
    },
    {
      kind: 'category',
      name: 'Target Selector',
      colour: colours.targetSelectors,
      contents: [
        { kind: 'block', type: targetSelectorRootType },
        ...targetSelectors.map(block => ({ kind: 'block', type: block.type })),
      ]
    }
  ]
}
