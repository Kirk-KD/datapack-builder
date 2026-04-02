import { mcfunctionGenerator } from '../../compiler/generator'
import type { BlockSpec } from './types'
import {setShadowState} from "../extensions/shadows.ts";
import * as Blockly from "blockly"
import {colours} from "../blockColours.ts";

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
      block.action_ = 'grant'
      block.specifier_ = 'everything'

      block.setColour(colours.commands)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)
      block.setPreviousStatement(true)
      block.setNextStatement(true)

      block.updateShape_ = function(this: AdvancementBlock) {
        this.inputList.filter(input => input.name !== '').forEach(input => this.removeInput(input.name))

        const actionDropdown = new Blockly.FieldDropdown([
          ['grant', 'grant'],
          ['revoke', 'revoke'],
        ], (newAction) => {
          if (!newAction || newAction === block.action_) return newAction
          block.action_ = newAction as AdvancementAction
          return newAction
        })
        this.appendValueInput(ADVANCEMENT_TARGET_NAME)
          .setCheck(['mc_param', 'mc_string', 'mc_target_selector']) // TODO validate target is player-type
          .appendField('advancement')
          .appendField(actionDropdown, ADVANCEMENT_ACTION_NAME)
        actionDropdown.setValue(this.action_)
        setShadowState(this, ADVANCEMENT_TARGET_NAME, { type: 'mc_target_selector' })

        const specifierDropdown = new Blockly.FieldDropdown([
          ['everything', 'everything'],
          ['only', 'only'],
          ['from', 'from'],
          ['through', 'through'],
          ['until', 'until'],
        ], (newSpecifier) => {
          if (!newSpecifier || newSpecifier === block.specifier_) return newSpecifier
          block.specifier_ = newSpecifier as AdvancementSpecifier
          block.updateShape_()
          return newSpecifier
        })
        this.appendDummyInput('HEADER').appendField(specifierDropdown, ADVANCEMENT_SPECIFIER_NAME)
        specifierDropdown.setValue(this.specifier_)

        if (this.specifier_ !== 'everything') {
          this.appendValueInput(ADVANCEMENT_ADVANCEMENT_NAME).setCheck(['mc_param', 'mc_string']) // TODO validate
          setShadowState(this, ADVANCEMENT_ADVANCEMENT_NAME, { type: 'mc_string', fields: { VALUE: 'minecraft:story/shiny_gear' } })
        }

        if (this.specifier_ === 'only') {
          this.appendValueInput(ADVANCEMENT_CRITERION_NAME).appendField(', criterion').setCheck(['mc_param', 'mc_string']) // TODO validate
          setShadowState(this, ADVANCEMENT_CRITERION_NAME, { type: 'mc_string', fields: { VALUE: '' } })
        }
      }

      block.saveExtraState = function(this: AdvancementBlock) {
        return {
          action_: this.action_,
          specifier_: this.specifier_,
        }
      }

      block.loadExtraState = function(this: AdvancementBlock, state: {
        action_: AdvancementAction,
        specifier_: AdvancementSpecifier,
      } | null) {
        this.action_ = state?.action_ ?? 'grant'
        this.specifier_ = state?.specifier_ ?? 'everything'
        this.updateShape_()
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
  }
]
