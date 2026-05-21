import type { BlockSpec } from '../types'
import type {EditorState, ItemStackEditorResult} from "../../../editor";
// TODO: this violates `core/` -> `ui/` dependency direction
// controller should be injected as a callback instead
import {loadFromSchema, controller} from "../../../../ui/editor";
import {bindExtraState, mutateExtraState, type StatefulBlock} from "../extraState.ts";
import {ItemSpriteField} from "../../fields/itemSpriteField.ts";
import * as Blockly from "blockly";
import {colours} from "../../colours.ts";
import {TextButton} from "../../fields/textButton.ts";
import {getItemRegistry, getItemSpritePath} from "../../../minecraft";
import {ItemStackNode} from '../../../compiler'
import {valueTypes} from '../valueTypes'

type ItemStackBlockState = {
  itemStackEditorState_: EditorState<ItemStackEditorResult>
  itemSpriteSrc_: string | null
}
type ItemStackBlock = StatefulBlock & ItemStackBlockState

const ITEM_SPRITE_FIELD_NAME = 'sprite'
const ITEM_STACK_EDITOR_FIELD_NAME = 'item_stack_editor'

function getItemStackButtonText(block: ItemStackBlock) {
  const itemName = block.itemStackEditorState_.data?.item.data
  const amountState = block.itemStackEditorState_.data?.amount
  const itemAmt = amountState?.data
  const regRef = amountState?.registryReference
  const hasRegRef = Boolean(regRef)

  if (!itemName || itemAmt === undefined || itemAmt === null) return 'edit item stack'

  const componentsSuffix = block.itemStackEditorState_.data?.components.length ? '[...]' : ''
  const amountDisplay = hasRegRef
    ? (regRef?.readableName ? `× ${regRef.readableName}` : `×`)
    : (itemAmt === 1 ? '' : `×${itemAmt}`)

  return `${itemName}${componentsSuffix} ${amountDisplay}`
}

export const constructBlockSpecs: BlockSpec[] = [
  {
    type: valueTypes.ItemStack,
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
      block.setOutput(true, valueTypes.ItemStack)

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
                  this.itemStackEditorState_ = (typeof next === 'function' ? next(this.itemStackEditorState_) : next) as
                    EditorState<ItemStackEditorResult>
                })

                const textField = this.getField(ITEM_STACK_EDITOR_FIELD_NAME)
                if (textField) {
                  textField.setValue(getItemStackButtonText(this))
                }

                const itemName = this.itemStackEditorState_.data?.item.data
                if (itemName) {
                  getItemRegistry().then(registry => {
                    const hasItem = registry.get(itemName)
                    mutateExtraState(this, () => {
                      this.itemSpriteSrc_ = hasItem ? getItemSpritePath(itemName) : null
                    })
                    const spriteField = this.getField(ITEM_SPRITE_FIELD_NAME)
                    if (spriteField) {
                      spriteField.setValue(this.itemSpriteSrc_ ?? undefined)
                    }
                  })
                } else {
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
          .appendField(new ItemSpriteField(this.itemSpriteSrc_ ?? undefined), ITEM_SPRITE_FIELD_NAME)
          .appendField(new TextButton(
            getItemStackButtonText(this), openEditor), ITEM_STACK_EDITOR_FIELD_NAME)
      }

      block.updateShape_()
    },
    generator(block: Blockly.Block) {
      const editorState = (block as ItemStackBlock).itemStackEditorState_
      return new ItemStackNode(editorState.data!, block.id)
    }
  }
]
