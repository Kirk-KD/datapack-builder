import * as Blockly from 'blockly'
import { commandBlockSpecs } from './commands'
import { controlBlockSpecs } from './control'
import { eventBlockSpecs } from './events'
import { executeBlockSpecs } from './execute'
import { literalBlockSpecs } from './literals'
import { procedureBlockSpecs } from './procedures'
import { selectorBlockSpecs, targetSelectorRootType } from './selectors'
import { variableBlockSpecs } from './variable'
import type { BlockGeneratorFunction, BlockJsonDefinition, BlockSpec, BlockSpecCategory } from './types'

const allBlockSpecs = [
  ...commandBlockSpecs,
  ...controlBlockSpecs,
  ...variableBlockSpecs,
  ...eventBlockSpecs,
  ...literalBlockSpecs,
  ...procedureBlockSpecs,
  ...executeBlockSpecs,
  ...selectorBlockSpecs,
]

const specsByCategory = new Map<BlockSpecCategory, BlockSpec[]>()

for (const spec of allBlockSpecs) {
  const specs = specsByCategory.get(spec.category) ?? []
  specs.push(spec)
  specsByCategory.set(spec.category, specs)
}

export function getBlockSpecs(): readonly BlockSpec[] {
  return allBlockSpecs
}

export function getBlockSpecsByCategory(category: BlockSpecCategory): readonly BlockSpec[] {
  return specsByCategory.get(category) ?? []
}

export function getBlockTypesByTag(tag: string): string[] {
  return allBlockSpecs
    .filter(spec => spec.tags?.includes(tag))
    .map(spec => spec.type)
}

export function getBlockJsonByCategory(category: BlockSpecCategory): BlockJsonDefinition[] {
  return getBlockSpecsByCategory(category)
    .flatMap(spec => (spec.json ? [spec.json] : []))
}

export function registerBlockSpecs() {
  const jsonBlocks = allBlockSpecs
    .flatMap(spec => (spec.json ? [spec.json] : []))

  if (jsonBlocks.length > 0) {
    Blockly.defineBlocksWithJsonArray(jsonBlocks)
  }

  for (const spec of allBlockSpecs) {
    if (spec.init) {
      Blockly.Blocks[spec.type] = { init: spec.init }
    }
  }
}

export function registerBlockSpecGenerators(
  registerGenerator: (type: string, generator: BlockGeneratorFunction) => void,
) {
  for (const spec of allBlockSpecs) {
    if (spec.generator) {
      registerGenerator(spec.type, spec.generator)
    }
  }
}

export { targetSelectorRootType }
