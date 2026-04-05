import * as Blockly from 'blockly'
import { colours } from '../blockColours'
import { ItemSpriteField } from '../fields/itemSpriteField'
import { OpenEditorTextField } from '../fields/openEditorTextField'
import { bindExtraState } from '../utils/extraState'
import type { BlockSpec } from './types'
import type { EditorBlock } from '../../editorModals/types'
import { loadMinecraftSpriteUrl } from '../../editorModals/data/itemCatalog'

const FIELD_ITEM_SPRITE = 'ITEM_SPRITE'
const FIELD_ITEM_NAME = 'ITEM_NAME'

const DEFAULT_TEXT = 'Create item stack...'

type ItemStackBlock = EditorBlock & {
  itemStackValue_: string
  itemStackSpriteFile_: string
  updatePreview_: () => void
}

function getPreviewText(value: string) {
  return value || DEFAULT_TEXT
}

export const constructBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_item_stack',
    category: 'constructs',
    init(this: Blockly.Block) {
      const block = this as ItemStackBlock

      bindExtraState(block, {
        itemStackValue_: '',
        itemStackSpriteFile_: '',
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
          previewField.setValue(getPreviewText(this.itemStackValue_))
        }

        const spriteField = this.getField(FIELD_ITEM_SPRITE)
        if (spriteField instanceof ItemSpriteField) {
          loadMinecraftSpriteUrl(this.itemStackSpriteFile_).then((spriteUrl) => {
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
          value: this.itemStackValue_,
          spriteFileName: this.itemStackSpriteFile_,
        }
      }

      block.applyEditorResult = function(this: ItemStackBlock, result: unknown) {
        if (typeof result === 'string') {
          this.itemStackValue_ = result
          this.itemStackSpriteFile_ = ''
          this.updatePreview_()
          return
        }

        if (!result || typeof result !== 'object') return

        const nextValue =
          'value' in result && typeof result.value === 'string'
            ? result.value
            : null
        const nextSpriteFile =
          'spriteFileName' in result && typeof result.spriteFileName === 'string'
            ? result.spriteFileName
            : ''

        if (nextValue === null) return

        this.itemStackValue_ = nextValue
        this.itemStackSpriteFile_ = nextSpriteFile
        this.updatePreview_()
      }

      block.updatePreview_()
    },
    generator(block) {
      const itemStackBlock = block as ItemStackBlock
      return [itemStackBlock.itemStackValue_ || 'minecraft:stone', 0]
    },
  },
]
