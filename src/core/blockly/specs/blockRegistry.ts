import * as Blockly from 'blockly'
import { commandBlockSpecs } from './categories/commands'
import { constructBlockSpecs } from './categories/constructs'
import { controlBlockSpecs } from './categories/control'
import { eventBlockSpecs } from './categories/events'
import { executeBlockSpecs } from './categories/execute'
import { literalBlockSpecs } from './categories/literals'
import { procedureBlockSpecs } from './categories/procedures'
import { selectorBlockSpecs, targetSelectorRootType } from './categories/selectors'
import { variableBlockSpecs } from './categories/variable'
import type { BlockGeneratorFunction, BlockJsonDefinition, BlockSpec, BlockSpecCategory } from './types'
import {shadowInputBlockSpecs} from "./shadowInputs.ts";

const allBlockSpecs = [
  ...commandBlockSpecs,
  ...controlBlockSpecs,
  ...variableBlockSpecs,
  ...eventBlockSpecs,
  ...literalBlockSpecs,
  ...constructBlockSpecs,
  ...procedureBlockSpecs,
  ...executeBlockSpecs,
  ...selectorBlockSpecs,
  ...shadowInputBlockSpecs,
]

const specsByCategory = new Map<BlockSpecCategory, BlockSpec[]>()

for (const spec of allBlockSpecs) {
  if (!spec.category) continue
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

export function getBlockTypesByCategory(category: BlockSpecCategory): string[] {
  return getBlockSpecsByCategory(category).map(spec => spec.type)
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

/**
 * Returns the extension name used to attach a spec's shadow toolboxSetup hook.
 */
function getShadowExtensionName(type: string) {
  return `shadows_${type}`
}

export function registerBlockSpecs() {
  const jsonBlocks = allBlockSpecs
    .flatMap(spec => {
      if (!spec.json) return []
      if (!spec.setShadowBlocks) return [spec.json]
      return [{
        ...spec.json,
        extensions: [...((spec.json.extensions as string[] | undefined) ?? []), getShadowExtensionName(spec.type)],
      }]
    })

  if (jsonBlocks.length > 0) {
    Blockly.defineBlocksWithJsonArray(jsonBlocks)
  }

  for (const spec of allBlockSpecs) {
    if (spec.init) {
      Blockly.Blocks[spec.type] = {
        init() {
          spec.init!.call(this)
          spec.setShadowBlocks?.call(this)
        },
      }
    }

    if (spec.setShadowBlocks) {
      Blockly.Extensions.register(getShadowExtensionName(spec.type), spec.setShadowBlocks)
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
