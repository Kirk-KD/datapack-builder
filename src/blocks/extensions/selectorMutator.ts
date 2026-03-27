import * as Blockly from 'blockly'
import { colours } from '../blockColours'

const selectorKeyOptions: [string, string][] = [
  ['x', 'x'],
  ['y', 'y'],
  ['z', 'z'],
  ['distance', 'distance'],
  ['dx', 'dx'],
  ['dy', 'dy'],
  ['dz', 'dz'],
  ['scores', 'scores'],
  ['tag', 'tag'],
  ['team', 'team'],
  ['limit', 'limit'],
  ['sort', 'sort'],
  ['level', 'level'],
  ['gamemode', 'gamemode'],
  ['name', 'name'],
  ['x_rotation', 'x_rotation'],
  ['y_rotation', 'y_rotation'],
  ['type', 'type'],
  ['family', 'family'],
  ['nbt', 'nbt'],
  ['advancements', 'advancements'],
  ['predicate', 'predicate'],
]

type SelectorMutatorState = {
  selectorKeys?: string[]
}

type SelectorMutatorBlock = Blockly.Block & {
  selectorKeys_: string[]
  updateShape_: () => void
  applyUniqueSelectorOptions_: () => void
}

function isSelectorMutatorEvent(event: Blockly.Events.Abstract): boolean {
  return (
    event.type === Blockly.Events.BLOCK_MOVE
    || event.type === Blockly.Events.BLOCK_CHANGE
    || event.type === Blockly.Events.BLOCK_CREATE
  )
}

if (!Blockly.Blocks['mc_selector_filter_container']) {
  Blockly.defineBlocksWithJsonArray([
    {
      "type": "mc_selector_filter_container",
      "message0": "selector filters %1 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "STACK"
        }
      ],
      "colour": colours.targetSelectors
    },
    {
      "type": "mc_selector_filter_item",
      "message0": "filter key %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "KEY",
          "options": selectorKeyOptions
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": colours.targetSelectors
    }
  ])
}

Blockly.Extensions.registerMutator(
  'mc_selector_mutator',
  {
    selectorKeys_: [],

    mutationToDom: function(this: SelectorMutatorBlock): Element {
      const container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('items', String(this.selectorKeys_.length))
      this.selectorKeys_.forEach(key => {
        const item = Blockly.utils.xml.createElement('item')
        item.setAttribute('key', key)
        container.appendChild(item)
      })
      return container
    },

    domToMutation: function(this: SelectorMutatorBlock, xmlElement: Element): void {
      const parsedKeys: string[] = []
      for (let child = xmlElement.firstElementChild; child; child = child.nextElementSibling) {
        if (child.tagName.toLowerCase() !== 'item') continue
        const key = child.getAttribute('key')
        if (!key) continue
        parsedKeys.push(key)
      }

      if (parsedKeys.length === 0) {
        const count = Number(xmlElement.getAttribute('items') ?? '0')
        this.selectorKeys_ = Array.from({ length: count }, () => selectorKeyOptions[0][1])
      } else this.selectorKeys_ = parsedKeys

      this.updateShape_()
    },

    saveExtraState: function(this: SelectorMutatorBlock): SelectorMutatorState {
      return { selectorKeys: [...this.selectorKeys_] }
    },

    loadExtraState: function(this: SelectorMutatorBlock, state: SelectorMutatorState): void {
      this.selectorKeys_ = [...(state.selectorKeys ?? [])]
      this.updateShape_()
    },

    decompose: function(this: SelectorMutatorBlock, workspace: Blockly.Workspace): Blockly.Block {
      const container = workspace.newBlock('mc_selector_filter_container')
      const containerBlock = container as Blockly.BlockSvg
      containerBlock.initSvg()

      let connection = container.getInput('STACK')?.connection
      this.selectorKeys_.forEach(key => {
        const itemBlock = workspace.newBlock('mc_selector_filter_item')
        const itemSvg = itemBlock as Blockly.BlockSvg
        itemSvg.initSvg()
        itemBlock.setFieldValue(key, 'KEY')

        if (connection) {
          connection.connect(itemBlock.previousConnection!)
          connection = itemBlock.nextConnection
        }
      })

      return container
    },

    compose: function(this: SelectorMutatorBlock, containerBlock: Blockly.Block): void {
      const parsedKeys: string[] = []
      let itemBlock = containerBlock.getInputTargetBlock('STACK')

      while (itemBlock) {
        parsedKeys.push(itemBlock.getFieldValue('KEY'))
        itemBlock = itemBlock.nextConnection?.targetBlock() ?? null
      }

      this.selectorKeys_ = parsedKeys
      this.updateShape_()
    },

    saveConnections: function(): void {},

    updateShape_: function(this: SelectorMutatorBlock): void {
      for (let i = 0; this.getInput(`FILTER_${i}`); i++) {
        this.removeInput(`FILTER_${i}`)
      }

      const validKeys = new Set(selectorKeyOptions.map(([, value]) => value))
      const seen = new Set<string>()
      this.selectorKeys_ = this.selectorKeys_.filter(key => {
        if (!validKeys.has(key) || seen.has(key)) return false
        seen.add(key)
        return true
      })

      this.selectorKeys_.forEach((key, i) => {
        const input = this.appendDummyInput(`FILTER_${i}`)
          .appendField(i === 0 ? 'with' : '')
          .appendField(new Blockly.FieldLabelSerializable(key), `KEY_${i}`)
          .appendField('=')
          .appendField(new Blockly.FieldTextInput('value'), `VALUE_${i}`)

        input.setAlign(Blockly.inputs.Align.RIGHT)
      })

      this.applyUniqueSelectorOptions_()
    },

    applyUniqueSelectorOptions_: function(this: SelectorMutatorBlock): void {
      const validKeys = new Set(selectorKeyOptions.map(([, value]) => value))
      const unique: string[] = []
      const seen = new Set<string>()

      this.selectorKeys_.forEach(key => {
        if (!validKeys.has(key) || seen.has(key)) return
        seen.add(key)
        unique.push(key)
      })

      this.selectorKeys_ = unique

      this.setWarningText(null)
    }
  },
  function(this: Blockly.Block): void {
    const block = this as SelectorMutatorBlock
    block.selectorKeys_ = []
    block.updateShape_()

    const previousOnChange = block.onchange ?? (() => {})
    block.setOnChange(function(this: SelectorMutatorBlock, event: Blockly.Events.Abstract): void {
      previousOnChange.call(this, event)
      if (!event || this.isInFlyout || !isSelectorMutatorEvent(event)) return

      const nextKeys: string[] = []
      for (let i = 0; ; i++) {
        const keyField = this.getField(`KEY_${i}`)
        if (!keyField) break
        nextKeys.push(this.getFieldValue(`KEY_${i}`))
      }

      this.selectorKeys_ = nextKeys
      this.applyUniqueSelectorOptions_()
    })
  },
  ['mc_selector_filter_item']
)
