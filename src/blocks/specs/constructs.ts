import type { BlockSpec } from './types'
import type {EditorState} from "../../editor/types.ts";
import type {ItemStackEditorResult} from "../../editor/editors/ItemStackEditor";
import {bindExtraState, type StatefulBlock} from "../utils/extraState.ts";
import {ItemSpriteField} from "../fields/itemSpriteField.ts";
import * as Blockly from "blockly";
import compileEditorState from "../../compiler/compileEditorState.ts";
import {colours} from "../blockColours.ts";
import {TextButton} from "../fields/textButton.ts";
import {controller} from "../../editor/modal/controller.ts";
import loadFromSchema from "../../editor/loadFromSchema.tsx";
import {getMinecraftItemByName} from "../../catalog/itemCatalog.ts";

type ItemStackBlockState = {
  itemStackEditorState_: EditorState<ItemStackEditorResult>
  itemSpriteSrc_: string | null
}
type ItemStackBlock = StatefulBlock & ItemStackBlockState

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
          controller.openEditorModal({
            title: 'Item Stack',
            editor: loadFromSchema({
              kind: 'reference',
              ref: 'item_stack'
            }, {
              context: {},
              state: this.itemStackEditorState_,
              setState: next => {
                this.itemStackEditorState_ = (typeof next === 'function' ? next(block.itemStackEditorState_) : next) as
                  EditorState<ItemStackEditorResult>

                const itemName = this.itemStackEditorState_.data?.item.data
                if (itemName) getMinecraftItemByName(itemName).then(result => {
                  this.itemSpriteSrc_ = result?.spriteFileName || null
                  if (this.updateShape_) this.updateShape_()
                })

                if (this.itemStackEditorState_.error) this.setWarningText('This item stack has an error.')
                else this.setWarningText(null)
              }
            })
          })
        }

        this.appendDummyInput('input')
          .appendField(new ItemSpriteField(this.itemSpriteSrc_ ? `src/data/minecraft/item_sprites/${this.itemSpriteSrc_}` : undefined), 'sprite')
          .appendField(new TextButton(
            (() => {
              const itemName = this.itemStackEditorState_.data?.item.data
              const itemAmt = this.itemStackEditorState_.data?.amount.data
              if (!itemName || !itemAmt) return 'edit item stack'
              return `${itemName}${this.itemStackEditorState_.data?.components.length ? '[...]' : ''} ${itemAmt === 1 ? '' : '×' + itemAmt}`
            })(), openEditor), 'item_stack_editor')
      }

      block.updateShape_()
    },
    generator(block: Blockly.Block) {
      const editorState = (block as ItemStackBlock).itemStackEditorState_
      console.log(editorState)
      if (editorState.error || editorState.data === undefined) return ''
      return [compileEditorState(editorState, { nbt: false }), 0]
    }
  }
]
