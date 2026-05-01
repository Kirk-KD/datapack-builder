import {getBlockJsonByCategory} from "./specs/blockRegistry.ts";
import type {BlockSpecCategory} from "./specs/types.ts";

const colours: Record<string, string> = {
  events: '#ffbf00',
  control: '#ffab19',
  commands: '#4c97ff',
  literals: '#006676',
  constructs: '#3aa57a',
  variable: '#ff8c1a',
  procedures: '#ff6680',
  execute: '#4c97ff',
  targetSelectors: '#5cb1d6',
}

function applyColour(category: BlockSpecCategory) {
  getBlockJsonByCategory(category).forEach(block => {
    block.colour = colours[category]
  })
}

function applyCategoryColours() {
  applyColour('commands')
  applyColour('control')
  applyColour('variable')
  applyColour('events')
  applyColour('literals')
  applyColour('constructs')
  applyColour('procedures')
  applyColour('execute')
}

export { colours, applyColour, applyCategoryColours }