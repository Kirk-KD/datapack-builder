import * as Blockly from 'blockly'
import { colours } from '../blockColours'
import { OpenEditorField } from '../fields/openEditorField'
import { bindExtraState } from '../utils/extraState'
import type { BlockSpec } from './types'
import type { EditorBlock } from '../../editorModals/types'

const FIELD_PREVIEW = 'PREVIEW'

type ItemStackBlock = EditorBlock & {
  itemStackValue_: string
  updatePreview_: () => void
}

function getPreviewText(value: string) {
  if (!value) return 'unset'
  return value.length > 28 ? `${value.slice(0, 25)}...` : value
}

export const constructBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_item_stack',
    category: 'constructs',
    init(this: Blockly.Block) {
      const block = this as ItemStackBlock

      bindExtraState(block, {
        itemStackValue_: '',
      })

      block.setOutput(true, 'mc_item_stack')
      block.setColour(colours.constructs)
      block.setTooltip('')
      block.setHelpUrl('')

      block.appendDummyInput('HEADER')
        .appendField('item stack')
        .appendField(new Blockly.FieldLabelSerializable('unset'), FIELD_PREVIEW)
        .appendField(new OpenEditorField({
          src: '/edit.svg',
          width: 16,
          height: 16,
          editorType: 'item_stack',
          title: 'Item Stack Editor',
        }), 'OPEN_EDITOR')

      block.updatePreview_ = function(this: ItemStackBlock) {
        const previewField = this.getField(FIELD_PREVIEW)
        if (previewField) {
          previewField.setValue(getPreviewText(this.itemStackValue_))
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
        }
      }

      block.applyEditorResult = function(this: ItemStackBlock, result: unknown) {
        if (typeof result !== 'string') return
        this.itemStackValue_ = result
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
