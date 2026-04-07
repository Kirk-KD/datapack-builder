import * as Blockly from 'blockly'
import { colours } from '../blockColours'
import { ItemSpriteField } from '../fields/itemSpriteField'
import { OpenEditorTextField } from '../fields/openEditorTextField'
import { bindExtraState } from '../utils/extraState'
import type { BlockSpec } from './types'
import type { EditorBlock } from '../../editorModals/types'
import { getMinecraftItemByName, loadMinecraftSpriteUrl } from '../../catalog/itemCatalog'
import {type SNBT, snbtToString} from "../../compiler/util.ts";

const FIELD_ITEM_SPRITE = 'ITEM_SPRITE'
const FIELD_ITEM_NAME = 'ITEM_NAME'

const DEFAULT_TEXT = 'Create item stack...'

type ItemStackBlock = EditorBlock & {
  itemStackId_: string
  itemStackCount_: number
  itemStackComponents_: Record<string, unknown>
  updatePreview_: () => void
}

function getPreviewText(id: string, components: Record<string, unknown>) {
  if (!id) {
    return DEFAULT_TEXT
  }

  return Object.keys(components).length > 0
    ? `${id}[...]`
    : id
}

function normalizeItemStackValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeItemStackValue(entry))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const record = value as Record<string, unknown>
  const hasId = typeof record.id === 'string'
  const hasLegacyValue = typeof record.value === 'string'
  const hasComponents = typeof record.components === 'object' && record.components !== null && !Array.isArray(record.components)

  if ((hasId || hasLegacyValue) && hasComponents) {
    const rawCount = typeof record.count === 'number' && !Number.isNaN(record.count)
      ? record.count
      : 1
    return {
      id: hasId ? record.id : record.value,
      count: Math.max(1, Math.trunc(rawCount)),
      components: normalizeItemStackValue(record.components),
    }
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, entryValue]) => [key, normalizeItemStackValue(entryValue)]),
  )
}

export const constructBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_item_stack',
    category: 'constructs',
    init(this: Blockly.Block) {
      const block = this as ItemStackBlock

      bindExtraState(block, {
        itemStackId_: '',
        itemStackCount_: 1,
        itemStackComponents_: {},
      })

      block.setOutput(true, 'mc_item_stack')
      block.setColour(colours.constructs)
      block.setTooltip('')
      block.setHelpUrl('')

      block.appendDummyInput('HEADER')
        .appendField(new ItemSpriteField(), FIELD_ITEM_SPRITE)
        .appendField(new OpenEditorTextField({
          text: DEFAULT_TEXT,
          editorType: 'item_stack',
          title: 'Item Stack Editor',
        }), FIELD_ITEM_NAME)

      block.updatePreview_ = function(this: ItemStackBlock) {
        const previewField = this.getField(FIELD_ITEM_NAME)
        if (previewField instanceof Blockly.FieldLabelSerializable) {
          previewField.setValue(getPreviewText(this.itemStackId_, this.itemStackComponents_))
        }

        const spriteField = this.getField(FIELD_ITEM_SPRITE)
        if (spriteField instanceof ItemSpriteField) {
          getMinecraftItemByName(this.itemStackId_)
            .then((entry) => loadMinecraftSpriteUrl(entry?.spriteFileName ?? ''))
            .then((spriteUrl) => {
            if (this.getField(FIELD_ITEM_SPRITE) === spriteField) {
              spriteField.setSpriteSource(spriteUrl ?? '')
            }
            })
        }
      }

      const originalLoadExtraState = block.loadExtraState?.bind(block)
      block.loadExtraState = function(this: ItemStackBlock, state) {
        originalLoadExtraState?.(state)
        this.updatePreview_()
      }

      block.getEditorContext = function(this: ItemStackBlock) {
        return {
          id: this.itemStackId_,
          count: this.itemStackCount_,
          components: this.itemStackComponents_,
        }
      }

      block.applyEditorResult = function(this: ItemStackBlock, result: unknown) {
        if (typeof result === 'string') {
          this.itemStackId_ = result
          this.itemStackCount_ = 1
          this.itemStackComponents_ = {}
          this.updatePreview_()
          return
        }

        if (!result || typeof result !== 'object') return

        const nextId =
          'id' in result && typeof result.id === 'string'
            ? result.id
            : 'value' in result && typeof result.value === 'string'
              ? result.value
            : null
        const nextCount =
          'count' in result && typeof result.count === 'number' && !Number.isNaN(result.count)
            ? Math.max(1, Math.trunc(result.count))
            : 1
        const nextComponents =
          'components' in result
          && result.components
          && typeof result.components === 'object'
          && !Array.isArray(result.components)
            ? normalizeItemStackValue(result.components) as Record<string, unknown>
            : {}

        if (nextId === null) return

        this.itemStackId_ = nextId
        this.itemStackCount_ = nextCount
        this.itemStackComponents_ = nextComponents
        this.updatePreview_()
      }

      block.updatePreview_()
    },
    generator(block) {
      const itemStackBlock = block as ItemStackBlock
      const itemStackComponents = Object.entries(itemStackBlock.itemStackComponents_)
        .map(([componentName, componentValue]) => `${componentName}=${snbtToString(normalizeItemStackValue(componentValue) as SNBT)}`)
        .join(',')
      const code = `${itemStackBlock.itemStackId_}[${itemStackComponents}]`
      return [code, 0]
    },
  },
]
