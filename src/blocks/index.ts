import * as Blockly from 'blockly'
import getControlCategory from './categories/control'
import { colours } from './blockColours'
import { getBlockJsonByCategory, registerBlockSpecs, targetSelectorRootType } from './specs/registry'
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
      contents: getBlockJsonByCategory('events').map(block => ({ kind: 'block', type: block.type }))
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
      contents: getBlockJsonByCategory('commands').map(block => ({ kind: 'block', type: block.type! }))
    },
    {
      kind: 'category',
      name: 'Literals',
      colour: colours.literals,
      contents: getBlockJsonByCategory('literals').map(block => ({ kind: 'block', type: block.type }))
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
      contents: getBlockJsonByCategory('execute').map(block => ({ kind: 'block', type: block.type }))
    },
    {
      kind: 'category',
      name: 'Target Selector',
      colour: colours.targetSelectors,
      contents: [
        { kind: 'block', type: targetSelectorRootType },
        ...getBlockJsonByCategory('targetSelectors')
          .filter(block => block.type !== targetSelectorRootType)
          .map(block => ({ kind: 'block', type: block.type })),
      ]
    }
  ]
}
