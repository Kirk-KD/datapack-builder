import * as Blockly from 'blockly'
import getControlCategory from './categories/control'
import { colours } from './blockColours'
import { getBlockJsonByCategory, getBlockTypesByCategory, registerBlockSpecs } from './specs/registry'
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

applyColour(getBlockJsonByCategory('commands'), colours.commands)
applyColour(getBlockJsonByCategory('control'), colours.control)
applyColour(getBlockJsonByCategory('variable'), colours.variable)
applyColour(getBlockJsonByCategory('events'), colours.events)
applyColour(getBlockJsonByCategory('literals'), colours.literals)
applyColour(getBlockJsonByCategory('procedures'), colours.procedures)
applyColour(getBlockJsonByCategory('execute'), colours.execute)
applyColour(getBlockJsonByCategory('targetSelectors'), colours.targetSelectors)

registerBlockSpecs()

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
      contents: getBlockTypesByCategory('execute').map(type => ({ kind: 'block', type }))
    },
    {
      kind: 'category',
      name: 'Target Selector',
      colour: colours.targetSelectors,
      contents: getBlockTypesByCategory('targetSelectors').map(type => ({ kind: 'block', type }))
    }
  ]
}
