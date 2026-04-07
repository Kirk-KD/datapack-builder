import { mcfunctionGenerator } from '../../compiler/generator'
import type { BlockSpec } from './types'
import {setShadowState} from "../extensions/shadows.ts";
import * as Blockly from "blockly"
import {colours} from "../blockColours.ts";
import { createStateCheckbox, createStateDropdown } from "../utils/dynamicFields.ts";
import { bindExtraState } from "../utils/extraState.ts";

const sayChecks = ['mc_string', 'mc_int', 'mc_param', 'mc_target_selector', 'MCCondition', 'mc_block_pos', 'mc_rotation', 'mc_range']

const ADVANCEMENT_ACTION_NAME = 'ACTION'
const ADVANCEMENT_TARGET_NAME = 'TARGET'
const ADVANCEMENT_SPECIFIER_NAME = 'SPECIFIER'
const ADVANCEMENT_ADVANCEMENT_NAME = 'ADVANCEMENT'
const ADVANCEMENT_CRITERION_NAME = 'CRITERION'
type AdvancementAction = 'grant' | 'revoke'
type AdvancementSpecifier = 'everything' | 'only' | 'from' | 'through' | 'until'
type AdvancementBlock = Blockly.BlockSvg & {
  action_: AdvancementAction
  specifier_: AdvancementSpecifier
  updateShape_: (this: AdvancementBlock) => void
}

const ATTRIBUTE_TARGET_NAME = 'TARGET'
const ATTRIBUTE_ATTRIBUTE_NAME = 'ATTRIBUTE'
const ATTRIBUTE_SCALE_NAME = 'SCALE'
const ATTRIBUTE_ACTION_NAME = 'ACTION'
const ATTRIBUTE_VALUE_NAME = 'VALUE'
const ATTRIBUTE_ID_NAME = 'ID'
const ATTRIBUTE_PROPERTY_NAME = 'PROPERTY'
type AttributeAction = 'get' | 'base get' | 'base set' | 'base reset' | 'modifier add' | 'modifier remove' | 'modifier value get'
type AttributeProperty = 'add_value' | 'add_multiplied_base' | 'add_multiplied_total'
type AttributeBlock = Blockly.BlockSvg & {
  action_: AttributeAction,
  property_: AttributeProperty | null,
  updateShape_: (this: AttributeBlock) => void
}

const CLONE_FROM_NAME = 'FROM'
const CLONE_SOURCE_DIMENSION_NAME = 'SOURCE_DIMENSION'
const CLONE_BEGIN_NAME = 'BEGIN'
const CLONE_END_NAME = 'END'
const CLONE_TO_NAME = 'TO'
const CLONE_TARGET_DIMENSION_NAME = 'TARGET_DIMENSION'
const CLONE_DESTINATION_NAME = 'DESTINATION'
const CLONE_STRICT_NAME = 'STRICT'
const CLONE_MASK_MODE_NAME = 'MASK_MODE'
const CLONE_FILTER_NAME = 'FILTER'
const CLONE_CLONE_MODE_NAME = 'CLONE_MODE'
type CloneMaskMode = '(none)' | 'replace' | 'masked' | 'filtered'
type CloneCloneMode = '(none)' | 'force' | 'move' | 'normal'
type CloneBlock = Blockly.BlockSvg & {
  hasFromDimension_: boolean,
  hasToDimension_: boolean,
  isStrict_: boolean,
  maskMode_: CloneMaskMode,
  cloneMode_: CloneCloneMode,
  updateShape_: (this: CloneBlock) => void,
}

export const commandBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_say',
    category: 'commands',
    json: {
      type: 'mc_say',
      message0: 'say %1',
      args0: [
        {
          type: 'input_value',
          name: 'MESSAGE',
          check: sayChecks,
        },
      ],
      inputsInline: true,
      tooltip: 'Broadcasts a message to all players',
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      const message = mcfunctionGenerator.valueToCode(block, 'MESSAGE', 0) || ''
      return `say ${message}\n`
    },
    setShadowBlocks(this) {
      setShadowState(this, 'MESSAGE', {
        type: 'mc_string',
        fields: { VALUE: 'Hello world' },
      })
    },
  },
  {
    type: 'mc_teleport',
    category: 'commands',
    json: {
      type: 'mc_teleport',
      message0: 'teleport %1 to %2',
      args0: [
        {
          type: 'input_value',
          name: 'SELECTOR',
          check: ['mc_param', 'mc_string', 'mc_target_selector'],
        },
        {
          type: 'input_value',
          name: 'TARGET',
          check: ['mc_param', 'mc_block_pos']
        }
      ],
      inputsInline: true,
      tooltip: 'Teleports to coordinates',
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      const selector = mcfunctionGenerator.valueToCode(block, 'SELECTOR', 0)
      const target = mcfunctionGenerator.valueToCode(block, 'TARGET', 0)
      return `teleport ${selector} ${target}\n`
    },
    setShadowBlocks(this) {
      setShadowState(this, 'SELECTOR', { type: 'mc_target_selector' })
      setShadowState(this, 'TARGET', { type: 'mc_block_pos' })
    },
  },
  {
    type: 'mc_advancement',
    category: 'commands',
    init(this: Blockly.Block) {
      const block = this as AdvancementBlock
      bindExtraState(block, {
        action_: 'grant' as AdvancementAction,
        specifier_: 'everything' as AdvancementSpecifier,
      })

      block.setColour(colours.commands)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setPreviousStatement(true)
      block.setNextStatement(true)

      block.updateShape_ = function(this: AdvancementBlock) {
        this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

        const actionDropdown = createStateDropdown(block, 'action_', [
          ['grant', 'grant'],
          ['revoke', 'revoke'],
        ] as [string, AdvancementAction][])
        this.appendValueInput(ADVANCEMENT_TARGET_NAME)
          .setCheck(['mc_param', 'mc_string', 'mc_target_selector']) // TODO validate target is player-type
          .appendField('advancement')
          .appendField(actionDropdown, ADVANCEMENT_ACTION_NAME)
        setShadowState(this, ADVANCEMENT_TARGET_NAME, { type: 'mc_target_selector' })

        const specifierDropdown = createStateDropdown(block, 'specifier_', [
          ['everything', 'everything'],
          ['only', 'only'],
          ['from', 'from'],
          ['through', 'through'],
          ['until', 'until'],
        ] as [string, AdvancementSpecifier][], { rerender: true })
        this.appendDummyInput('HEADER').appendField(specifierDropdown, ADVANCEMENT_SPECIFIER_NAME)

        if (this.specifier_ !== 'everything') {
          this.appendValueInput(ADVANCEMENT_ADVANCEMENT_NAME).setCheck(['mc_param', 'mc_string']) // TODO validate
          setShadowState(this, ADVANCEMENT_ADVANCEMENT_NAME, { type: 'mc_string', fields: { VALUE: 'minecraft:story/shiny_gear' } })
        }

        if (this.specifier_ === 'only') {
          this.appendValueInput(ADVANCEMENT_CRITERION_NAME).appendField('with criterion').setCheck(['mc_param', 'mc_string']) // TODO validate
          setShadowState(this, ADVANCEMENT_CRITERION_NAME, { type: 'mc_string', fields: { VALUE: '' } })
        }
      }

      block.updateShape_()
    },
    generator(block: Blockly.Block) {
      const action = block.getFieldValue(ADVANCEMENT_ACTION_NAME)
      const target = mcfunctionGenerator.valueToCode(block, ADVANCEMENT_TARGET_NAME, 0)
      const specifier = block.getFieldValue(ADVANCEMENT_SPECIFIER_NAME)
      const advancement = block.getInput(ADVANCEMENT_ADVANCEMENT_NAME) ?
        ` ${mcfunctionGenerator.valueToCode(block, ADVANCEMENT_ADVANCEMENT_NAME, 0)}` : ''
      const criterion = block.getInput(ADVANCEMENT_CRITERION_NAME) ?
        ` ${mcfunctionGenerator.valueToCode(block, ADVANCEMENT_CRITERION_NAME, 0)}` : ''
      return `advancement ${action} ${target} ${specifier}${advancement}${criterion}\n`
    }
  },
  {
    type: 'mc_attribute',
    category: 'commands',
    init(this: Blockly.Block) {
      const block = this as AttributeBlock
      bindExtraState(block, {
        action_: 'get' as AttributeAction,
        property_: null as AttributeProperty | null,
      }, {
        loadDefaults: {
          action_: 'get' as AttributeAction,
          property_: 'add_value' as AttributeProperty,
        },
      })

      block.setColour(colours.commands)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setPreviousStatement(true)
      block.setNextStatement(true)

      block.updateShape_ = function(this: AttributeBlock) {
        this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

        this.appendValueInput(ATTRIBUTE_TARGET_NAME)
          .setCheck(['mc_param', 'mc_string', 'mc_target_selector'])
          .appendField('attribute')
        setShadowState(this, ATTRIBUTE_TARGET_NAME, { type: 'mc_target_selector' })

        this.appendValueInput(ATTRIBUTE_ATTRIBUTE_NAME)
          .setCheck(['mc_param', 'mc_string'])
        setShadowState(this, ATTRIBUTE_ATTRIBUTE_NAME, { type: 'mc_string', fields: { VALUE: 'minecraft:max_health' } })

        const actionDropdown = createStateDropdown(block, 'action_', [
          ['get', 'get'],
          ['base get', 'base get'],
          ['base set', 'base set'],
          ['base reset', 'base reset'],
          ['modifier add', 'modifier add'],
          ['modifier remove', 'modifier remove'],
          ['modifier value get', 'modifier value get']
        ] as [string, AttributeAction][], { rerender: true })
        this.appendDummyInput('dummy')
          .appendField(actionDropdown, ATTRIBUTE_ACTION_NAME)

        const appendScaleInput = () => {
          this.appendValueInput(ATTRIBUTE_SCALE_NAME)
            .setCheck(['mc_param', 'number'])
            .appendField('scaled by')
          setShadowState(this, ATTRIBUTE_SCALE_NAME, { type: 'number', fields: { VALUE: '1' } })
        }
        const appendIdInput = () => {
          this.appendValueInput(ATTRIBUTE_ID_NAME)
            .setCheck(['mc_param', 'mc_string'])
          setShadowState(this, ATTRIBUTE_ID_NAME, { type: 'mc_string', fields: { VALUE: 'custom_id'} })
        }
        const appendValueInput = () => {
          this.appendValueInput(ATTRIBUTE_VALUE_NAME)
            .setCheck(['mc_param', 'number'])
          setShadowState(this, ATTRIBUTE_VALUE_NAME, { type: 'number' })
        }
        if (this.action_ === 'get' || this.action_ === 'base get') {
          appendScaleInput()
        } else if (this.action_ === 'base set') {
          appendValueInput()
        } else if (this.action_ === 'modifier add') {
          appendIdInput()
          appendValueInput()
          const propertyDropdown = createStateDropdown(block, 'property_', [
            ['add_value', 'add_value'],
            ['add_multiplied_base', 'add_multiplied_base'],
            ['add_multiplied_total', 'add_multiplied_total']
          ] as [string, AttributeProperty][], { fallbackValue: 'add_value' })
          this.appendDummyInput('dummy1')
            .appendField(propertyDropdown, ATTRIBUTE_PROPERTY_NAME)
        } else if (this.action_ === 'modifier remove') {
          appendIdInput()
        } else if (this.action_ === 'modifier value get') {
          appendIdInput()
          appendScaleInput()
        }
      }

      block.updateShape_()
    },
    generator(block: Blockly.Block) {
      const target = mcfunctionGenerator.valueToCode(block, ATTRIBUTE_TARGET_NAME, 0)
      const attribute = mcfunctionGenerator.valueToCode(block, ATTRIBUTE_ATTRIBUTE_NAME, 0)
      const action = block.getFieldValue(ATTRIBUTE_ACTION_NAME)
      const scale = block.getInput(ATTRIBUTE_SCALE_NAME) ?
        ` ${mcfunctionGenerator.valueToCode(block, ATTRIBUTE_SCALE_NAME, 0)}` : ''
      const value = block.getInput(ATTRIBUTE_VALUE_NAME) ?
        ` ${mcfunctionGenerator.valueToCode(block, ATTRIBUTE_VALUE_NAME, 0)}` : ''
      const id = block.getInput(ATTRIBUTE_ID_NAME) ?
        ` ${mcfunctionGenerator.valueToCode(block, ATTRIBUTE_ID_NAME, 0)}` : ''
      const property = ` ${block.getFieldValue(ATTRIBUTE_PROPERTY_NAME) ?? ''}`
      return `attribute ${target} ${attribute} ${action}${id}${value}${scale}${property}\n`
    }
  },
  {
    type: 'mc_clone',
    category: 'commands',
    init(this: Blockly.Block) {
      const block = this as CloneBlock
      bindExtraState(block, {
        hasFromDimension_: false,
        hasToDimension_: false,
        isStrict_: false,
        maskMode_: '(none)' as CloneMaskMode,
        cloneMode_: '(none)' as CloneCloneMode,
      })

      block.setColour(colours.commands)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setPreviousStatement(true)
      block.setNextStatement(true)

      block.updateShape_ = function(this: CloneBlock) {
        this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

        this.appendDummyInput('1').appendField('clone')

        this.appendValueInput(CLONE_BEGIN_NAME)
          .setCheck(['mc_param', 'mc_block_pos'])
        setShadowState(this, CLONE_BEGIN_NAME, { type: 'mc_block_pos' })

        this.appendValueInput(CLONE_END_NAME)
          .setCheck(['mc_param', 'mc_block_pos'])
        setShadowState(this, CLONE_END_NAME, { type: 'mc_block_pos' })

        this.appendDummyInput('2')
          .appendField('in dimension?')
          .appendField(createStateCheckbox(block, 'hasFromDimension_', { rerender: true }), CLONE_FROM_NAME)

        if (this.hasFromDimension_) {
          this.appendValueInput(CLONE_SOURCE_DIMENSION_NAME)
            .setCheck(['mc_param', 'mc_string'])
          setShadowState(this, CLONE_SOURCE_DIMENSION_NAME, { type: 'mc_string', fields: { VALUE: 'minecraft:overworld' }})
        }

        this.appendValueInput(CLONE_DESTINATION_NAME)
          .setCheck(['mc_param', 'mc_block_pos'])
          .appendField('to')
        setShadowState(this, CLONE_DESTINATION_NAME, { type: 'mc_block_pos' })

        this.appendDummyInput('3')
          .appendField('in dimension?')
          .appendField(createStateCheckbox(block, 'hasToDimension_', { rerender: true }), CLONE_TO_NAME)

        if (this.hasToDimension_) {
          this.appendValueInput(CLONE_TARGET_DIMENSION_NAME)
            .setCheck(['mc_param', 'mc_string'])
          setShadowState(this, CLONE_TARGET_DIMENSION_NAME, { type: 'mc_string', fields: { VALUE: 'minecraft:overworld' } })
        }

        this.appendDummyInput('4')
          .appendField('strict?')
          .appendField(createStateCheckbox(block, 'isStrict_'), CLONE_STRICT_NAME)

        const maskModeDropdown = createStateDropdown(block, 'maskMode_', [
          ['(none)', '(none)'],
          ['replace', 'replace'],
          ['masked', 'masked'],
          ['filtered', 'filtered'],
        ] as [string, CloneMaskMode][], { rerender: true })
        this.appendDummyInput('5')
          .appendField('mask mode:')
          .appendField(maskModeDropdown, CLONE_MASK_MODE_NAME)

        if (block.maskMode_ === 'filtered') {
          this.appendValueInput(CLONE_FILTER_NAME)
            .setCheck(['mc_param', 'mc_string']) // TODO block predicate
          setShadowState(this, CLONE_FILTER_NAME, { type: 'mc_string', fields: { VALUE: 'minecraft:stone' } })
        }

        const cloneModeDropdown = createStateDropdown(block, 'cloneMode_', [
          ['(none)', '(none)'],
          ['force', 'force'],
          ['move', 'move'],
          ['normal', 'normal'],
        ] as [string, CloneCloneMode][])
        this.appendDummyInput('5')
          .appendField('clone mode:')
          .appendField(cloneModeDropdown, CLONE_CLONE_MODE_NAME)
      }

      block.updateShape_()
    },
    generator(block: Blockly.Block) {
      const cloneBlock = block as CloneBlock

      let cmd = 'clone'

      if (cloneBlock.hasFromDimension_) {
        const srcDim = mcfunctionGenerator.valueToCode(cloneBlock, CLONE_SOURCE_DIMENSION_NAME, 0)
        cmd += ` from ${srcDim}`
      }

      const begin = mcfunctionGenerator.valueToCode(cloneBlock, CLONE_BEGIN_NAME, 0)
      const end = mcfunctionGenerator.valueToCode(cloneBlock, CLONE_END_NAME, 0)
      cmd += ` ${begin} ${end}`

      if (cloneBlock.hasToDimension_) {
        const tarDim = mcfunctionGenerator.valueToCode(cloneBlock, CLONE_TARGET_DIMENSION_NAME, 0)
        cmd += ` to ${tarDim}`
      }

      const destination = mcfunctionGenerator.valueToCode(cloneBlock, CLONE_DESTINATION_NAME, 0)
      cmd += ` ${destination}`

      if (cloneBlock.isStrict_) cmd += ' strict'

      if (cloneBlock.maskMode_ !== '(none)') cmd += ` ${cloneBlock.maskMode_}`
      if (cloneBlock.maskMode_ === 'filtered') {
        const filter = mcfunctionGenerator.valueToCode(cloneBlock, CLONE_FILTER_NAME, 0)
        cmd += ` ${filter}`
      }

      if (cloneBlock.cloneMode_ !== '(none)') cmd += ` ${cloneBlock.cloneMode_}`

      return cmd + '\n'
    }
  },
  {
    type: 'mc_give',
    category: 'commands',
    json: {
      type: 'mc_give',
      message0: 'give %1 %2 count: %3',
      args0: [
        {
          type: 'input_value',
          name: 'TARGET',
          check: ['mc_param', 'mc_string', 'mc_target_selector'],
        },
        {
          type: 'input_value',
          name: 'ITEM',
          check: ['mc_param', 'mc_string']
        },
        {
          type: 'input_value',
          name: 'COUNT',
          check: ['mc_param', 'number'],
        }
      ],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
    },
    generator(block) {
      const target = mcfunctionGenerator.valueToCode(block, 'TARGET', 0)
      const item = mcfunctionGenerator.valueToCode(block, 'ITEM', 0)
      const count = mcfunctionGenerator.valueToCode(block, 'COUNT', 0)
      return `give ${target} ${item} ${count}\n`
    },
    setShadowBlocks(this) {
      setShadowState(this, 'TARGET', { type: 'mc_target_selector' })
      setShadowState(this, 'ITEM', { type: 'mc_string' })
      setShadowState(this, 'COUNT', { type: 'number', fields: { VALUE: '1' } })
    }
  }
]
