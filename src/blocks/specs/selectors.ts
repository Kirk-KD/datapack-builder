// TODO shadow blocks for inputs
// TODO accept `mc_param`
import * as Blockly from 'blockly'
import { colours } from '../blockColours'
import { ToggleImageField } from '../fields/toggleImage'
import { mcfunctionGenerator } from '../../compiler/generator'
import type { BlockSpec } from './types'
import { setShadowState } from '../extensions/shadows.ts'

const INPUT_FILTER_STACK = 'FILTER_STACK'
const FIELD_BASE = 'BASE'

export const targetSelectorRootType = 'mc_target_selector'

const selectorBaseOptions: [string, string][] = [
  ['command executer (@s)', '@s'],
  ['nearest player (@p)', '@p'],
  ['random player (@r)', '@r'],
  ['all players (@a)', '@a'],
  ['nearest entity (@n)', '@n'],
  ['all entities (@e)', '@e'],
]

type TargetSelectorBlock = Blockly.BlockSvg & {
  showFilters_: boolean
  updateShape_: () => void
}

function createFilterSpec(
  type: string,
  message0: string,
  args0: Record<string, unknown>[],
  generator: (block: Blockly.Block) => string,
  setShadowBlocks?: (this: Blockly.Block) => void,
): BlockSpec {
  return {
    type,
    category: 'targetSelectors',
    tags: ['selectorFilter'],
    json: {
      type,
      tooltip: '',
      helpUrl: '',
      message0,
      args0,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
    },
    generator,
    setShadowBlocks,
  }
}

function getFilterString(block: Blockly.Block): string {
  const filterStack = mcfunctionGenerator.statementToCode(block, INPUT_FILTER_STACK) || ''
  const filters = filterStack.trim().split(',').filter((filter: string) => filter.length > 0)
  return filters.length > 0 ? `[${filters.join(',')}]` : ''
}

export function compileSelector(block: Blockly.Block): string {
  return block.getFieldValue(FIELD_BASE) + getFilterString(block)
}

export const selectorBlockSpecs: BlockSpec[] = [
  {
    type: targetSelectorRootType,
    category: 'targetSelectors',
    init(this: Blockly.Block) {
      const block = this as TargetSelectorBlock
      block.showFilters_ = false
      block.setOutput(true, targetSelectorRootType)
      block.setColour(colours.targetSelectors)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(false)

      block.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(selectorBaseOptions), FIELD_BASE)
        .appendField(new ToggleImageField({ // TODO change svg to simple vs complex instead of collapse vs expand
          collapsedSrc: '/expand.svg',
          expandedSrc: '/collapse.svg',
          width: 16,
          height: 16,
          collapsedAlt: 'Show filters',
          expandedAlt: 'Hide filters',
          initialExpanded: block.showFilters_,
          onToggle: (expanded) => {
            block.showFilters_ = expanded
            block.updateShape_()
          },
        }), 'SHOW_FILTERS_TOGGLE')

      block.appendStatementInput(INPUT_FILTER_STACK).appendField('with')
      block.updateShape_ = function(this: TargetSelectorBlock) {
        const existingInput = this.getInput(INPUT_FILTER_STACK)

        if (!this.showFilters_) {
          if (existingInput) {
            const connection = existingInput.connection
            if (connection) {
              connection.disconnect()
            }
            this.removeInput(INPUT_FILTER_STACK)
          }
        } else {
          if (!existingInput) {
            this.appendStatementInput(INPUT_FILTER_STACK)
          }
        }

        if (this.rendered) {
          this.render()
        }
      }

      block.saveExtraState = function(this: TargetSelectorBlock) {
        return this.showFilters_ ? { showFilters: true } : null
      }

      block.loadExtraState = function(this: TargetSelectorBlock, state: { showFilters?: boolean } | null) {
        this.showFilters_ = !!state?.showFilters
        const toggleField = this.getField('SHOW_FILTERS_TOGGLE')
        if (toggleField instanceof ToggleImageField) {
          toggleField.setExpanded(this.showFilters_)
        }
        this.updateShape_()
      }

      block.updateShape_()
    },
    generator(block) {
      return [compileSelector(block), 0]
    },
  },
  createFilterSpec('mc_target_filter_limit', 'limit %1', [{ type: 'field_input', name: 'LIMIT', text: '' }], block => `limit=${block.getFieldValue('LIMIT')},`),
  createFilterSpec('mc_target_filter_sort', 'sort by %1', [{
    type: 'field_dropdown',
    name: 'SORT',
    options: [
      ['increasing distance', 'nearest'],
      ['decreasing distance', 'furthest'],
      ['random', 'random'],
      ['arbitrary', 'arbitrary'],
    ],
  }], block => `sort=${block.getFieldValue('SORT')},`),
  createFilterSpec('mc_target_filter_position', 'position x %1 y %2 z %3', [
    { type: 'field_input', name: 'X', text: '' },
    { type: 'field_input', name: 'Y', text: '' },
    { type: 'field_input', name: 'Z', text: '' },
  ], block => `x=${block.getFieldValue('X')},y=${block.getFieldValue('Y')},z=${block.getFieldValue('Z')},`),
  createFilterSpec('mc_target_filter_distance', 'distance %1', [
    { type: 'input_value', name: 'RANGE', check: ['mc_range'] },
  ], block => `distance=${mcfunctionGenerator.valueToCode(block, 'RANGE', 0)},`, function(this: Blockly.Block) {
    setShadowState(this, 'RANGE', { type: 'mc_range' })
  }),
  createFilterSpec('mc_target_filter_volume', 'volume dx %1 dy %2 dz %3', [
    { type: 'field_input', name: 'DX', text: '' },
    { type: 'field_input', name: 'DY', text: '' },
    { type: 'field_input', name: 'DZ', text: '' },
  ], block => `dx=${block.getFieldValue('DX')},dy=${block.getFieldValue('DY')},dz=${block.getFieldValue('DZ')},`),
  createFilterSpec('mc_target_filter_vert_rot', 'vertical rotation min %1 max %2', [
    { type: 'field_input', name: 'MIN', text: '' },
    { type: 'field_input', name: 'MAX', text: '' },
  ], block => `x_rotation=${block.getFieldValue('MIN')}..${block.getFieldValue('MAX')},`),
  createFilterSpec('mc_target_filter_hori_rot', 'horizontal rotation min %1 max %2', [
    { type: 'field_input', name: 'MIN', text: '' },
    { type: 'field_input', name: 'MAX', text: '' },
  ], block => `y_rotation=${block.getFieldValue('MIN')}..${block.getFieldValue('MAX')},`),
  createFilterSpec('mc_target_filter_type', 'entity type %1', [{ type: 'field_input', name: 'TYPE', text: '' }], block => `type=${block.getFieldValue('TYPE')},`),
  createFilterSpec('mc_target_filter_name', 'entity name %1', [{ type: 'field_input', name: 'NAME', text: '' }], block => `name=${block.getFieldValue('NAME')},`),
  createFilterSpec('mc_target_filter_predicates', 'predicates %1', [{ type: 'field_input', name: 'PREDICATE', text: '' }], block => `predicate=${block.getFieldValue('PREDICATE')},`),
  createFilterSpec('mc_target_filter_nbt', 'NBT data %1', [{ type: 'field_input', name: 'NBT', text: '' }], block => `nbt=${block.getFieldValue('NBT')},`),
  createFilterSpec('mc_target_filter_scores', 'scores %1', [{ type: 'field_input', name: 'SCORES', text: '' }], block => `scores=${block.getFieldValue('SCORES')},`),
  createFilterSpec('mc_target_filter_tags', 'tags %1', [{ type: 'field_input', name: 'TAG', text: '' }], block => `tag=${block.getFieldValue('TAG')},`),
  createFilterSpec('mc_target_filter_team', 'team %1', [{ type: 'field_input', name: 'TEAM', text: '' }], block => `team=${block.getFieldValue('TEAM')},`),
  createFilterSpec('mc_target_filter_xp', 'xp %1', [
    { type: 'input_value', name: 'RANGE', check: ['mc_range'] },
  ], block => `level=${mcfunctionGenerator.valueToCode(block, 'RANGE', 0)},`, function(this: Blockly.Block) {
    setShadowState(this, 'RANGE', { type: 'mc_range' })
  }),
  createFilterSpec('mc_target_filter_gamemode', 'gamemode %1', [{
    type: 'field_dropdown',
    name: 'GAMEMODE',
    options: [
      ['survival', 'survival'],
      ['creative', 'creative'],
      ['adventure', 'adventure'],
      ['spectator', 'spectator'],
    ],
  }], block => `gamemode=${block.getFieldValue('GAMEMODE')},`),
  createFilterSpec('mc_target_filter_advancements', 'advancements %1', [{ type: 'field_input', name: 'ADVANCEMENTS', text: '' }], block => `advancements=${block.getFieldValue('ADVANCEMENTS')},`),
]
