import * as Blockly from 'blockly'
import definitionsJson from './definitions.json'

const { commands, control, variable } = definitionsJson as {
  commands: { type: string }[]
  control: { type: string }[]
  variable: { type: string }[]
}

Blockly.defineBlocksWithJsonArray(commands)
Blockly.defineBlocksWithJsonArray(control)
Blockly.defineBlocksWithJsonArray(variable)

const builtinBlocks: string[] = [
  'math_number'
]

export default function getToolboxContents() {
  return [
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
      contents: control.map(block => ({ kind: 'block', type: block.type }))
    },
    {
      kind: 'category',
      name: 'Literals',
      colour: '65',
      contents: builtinBlocks.map(type => ({ kind: 'block', type }))
    }
  ]
}