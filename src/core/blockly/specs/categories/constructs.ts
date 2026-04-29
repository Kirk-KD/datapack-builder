import type { BlockSpec } from '../types'
import type {EditorState, ItemStackEditorResult} from "../../../editor";
import {loadFromSchema, controller} from "../../../../ui/editor";
import {bindExtraState, mutateExtraState, type StatefulBlock} from "../extraState.ts";
import {ItemSpriteField} from "../../fields/itemSpriteField.ts";
import * as Blockly from "blockly";
import compileEditorState from "../../../compiler/editor/compileEditorState.ts";
import {colours} from "../../colours.ts";
import {TextButton} from "../../fields/textButton.ts";
import {getMinecraftItemByName} from "../../../catalog";

type ItemStackBlockState = {
  itemStackEditorState_: EditorState<ItemStackEditorResult>
  itemSpriteSrc_: string | null
}
type ItemStackBlock = StatefulBlock & ItemStackBlockState

const ITEM_SPRITE_FIELD_NAME = 'sprite'
const ITEM_STACK_EDITOR_FIELD_NAME = 'item_stack_editor'

function getItemStackButtonText(block: ItemStackBlock) {
  const itemName = block.itemStackEditorState_.data?.item.data
  const itemAmt = block.itemStackEditorState_.data?.amount.data
  if (!itemName || !itemAmt) return 'edit item stack'
  return `${itemName}${block.itemStackEditorState_.data?.components.length ? '[...]' : ''} ${itemAmt === 1 ? '' : '×' + itemAmt}`
}

export const constructBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_item_stack',
    category: 'constructs',
    init(this: Blockly.Block) {
      const block = this as ItemStackBlock
      bindExtraState<ItemStackBlock, ItemStackBlockState>(block, {
        itemStackEditorState_: {
          compiler: 'item_stack',
          error: false,
        },
        itemSpriteSrc_: null
      })

      block.setColour(colours.constructs)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setOutput(true, 'mc_item_stack')

      block.updateShape_ = function(this: ItemStackBlock) {
        this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

        const openEditor = () => {
          if (this.isShadow()) {
            const parentConnection = this.outputConnection.targetConnection
            if (parentConnection) {
              parentConnection.disconnect()
              parentConnection.connect(this.outputConnection)
            }
            this.setShadow(false)
          }

          controller.openEditorModal({
            title: 'Item Stack',
            editor: loadFromSchema({
              kind: 'reference',
              ref: 'item_stack'
            }, {
              context: {},
              state: this.itemStackEditorState_,
              setState: next => {
                mutateExtraState(this, () => {
                  this.itemStackEditorState_ = (typeof next === 'function' ? next(block.itemStackEditorState_) : next) as
                    EditorState<ItemStackEditorResult>
                })

                const textField = this.getField(ITEM_STACK_EDITOR_FIELD_NAME)
                if (textField) {
                  textField.setValue(getItemStackButtonText(this))
                }

                const itemName = this.itemStackEditorState_.data?.item.data
                if (itemName) getMinecraftItemByName(itemName).then(result => {
                  mutateExtraState(this, () => {
                    this.itemSpriteSrc_ = result?.spriteFileName || null
                  })
                  const spriteField = this.getField(ITEM_SPRITE_FIELD_NAME)
                  if (spriteField) {
                    spriteField.setValue(this.itemSpriteSrc_ ? `src/data/minecraft/item_sprites/${this.itemSpriteSrc_}` : undefined)
                  }
                })
                else {
                  mutateExtraState(this, () => {
                    this.itemSpriteSrc_ = null
                  })
                  const spriteField = this.getField(ITEM_SPRITE_FIELD_NAME)
                  if (spriteField) {
                    spriteField.setValue(undefined)
                  }
                }

                if (this.itemStackEditorState_.error) this.setWarningText('This item stack has an error.')
                else this.setWarningText(null)
              }
            })
          })
        }

        this.appendDummyInput('input')
          .appendField(new ItemSpriteField(this.itemSpriteSrc_ ? `src/data/minecraft/item_sprites/${this.itemSpriteSrc_}` : undefined), ITEM_SPRITE_FIELD_NAME)
          .appendField(new TextButton(
            getItemStackButtonText(this), openEditor), ITEM_STACK_EDITOR_FIELD_NAME)
      }

      block.updateShape_()
    },
    generator(block: Blockly.Block) {
      const editorState = (block as ItemStackBlock).itemStackEditorState_
      if (editorState.error || editorState.data === undefined) return ''
      return [compileEditorState(editorState, { nbt: false }), 0]
    }
  }
]
