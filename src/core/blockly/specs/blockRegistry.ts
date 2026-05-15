import * as Blockly from 'blockly'
import { commandBlockSpecs } from './categories/commands'
import { constructBlockSpecs } from './categories/constructs'
import { controlBlockSpecs } from './categories/control'
import { eventBlockSpecs } from './categories/events'
import { executeBlockSpecs } from './categories/execute'
import { literalBlockSpecs } from './categories/literals'
import { procedureBlockSpecs } from './categories/procedures'
import { selectorBlockSpecs } from './categories/selectors'
import { variableBlockSpecs } from './categories/variable'
import { shadowInputBlockSpecs } from "./shadowInputs.ts"
import {registerBlockIrGenerator} from '../../compiler'
import type { BlockJsonDefinition, BlockSpec, BlockSpecCategory } from './types'
import {utilityBlockSpecs} from './categories/utility.ts'
import {constantsBlockSpecs} from './categories/constants.ts'
import {mathBlockSpecs} from './categories/math.ts'

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
  ...utilityBlockSpecs,
  ...constantsBlockSpecs,
  ...mathBlockSpecs
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

/**
 * Returns the extension name used to attach a spec's context menu hook.
 */
function getContextMenuExtensionName(type: string) {
  return `context_menu_${type}`
}

function applySpecContextMenu(block: Blockly.Block, spec: BlockSpec) {
  const blockSvg = block as Blockly.BlockSvg
  blockSvg.customContextMenu = function(options) {
    options.length = 0
    spec.contextMenu?.call(this, options as Blockly.ContextMenuRegistry.ContextMenuOption[])
  }
}

export function registerBlockSpecs() {
  const jsonBlocks = allBlockSpecs
    .flatMap(spec => {
      if (!spec.json) return []
      const extensions = [
        ...((spec.json.extensions as string[] | undefined) ?? []),
        getContextMenuExtensionName(spec.type),
      ]
      if (!spec.setShadowBlocks) {
        return [{
          ...spec.json,
          extensions,
        }]
      }
      return [{
        ...spec.json,
        extensions: [...extensions, getShadowExtensionName(spec.type)],
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
          applySpecContextMenu(this, spec)
        },
      }
    }

    Blockly.Extensions.register(getContextMenuExtensionName(spec.type), function(this: Blockly.Block) {
      applySpecContextMenu(this, spec)
    })

    if (spec.setShadowBlocks) {
      Blockly.Extensions.register(getShadowExtensionName(spec.type), spec.setShadowBlocks)
    }

    registerBlockIrGenerator(spec)
  }
}
