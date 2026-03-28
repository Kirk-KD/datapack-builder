import * as Blockly from 'blockly'
import { colours } from '../blockColours'
import { ToggleImageField } from '../fields/toggleImage'
import { chainableBlocks } from './shared'

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

export function registerTargetSelectorBlock() {
  Blockly.Blocks[targetSelectorRootType] = {
    init(this: TargetSelectorBlock) {
      this.showFilters_ = false
      this.setOutput(true, targetSelectorRootType)
      this.setColour(colours.targetSelectors)
      this.setTooltip('')
      this.setHelpUrl('')
      this.setInputsInline(false)

      this.appendValueInput('CHAIN_NEXT')
        .setCheck(chainableBlocks)
        .appendField(new Blockly.FieldDropdown(selectorBaseOptions), 'BASE')
        .appendField(new ToggleImageField({
          collapsedSrc: '/expand.svg',
          expandedSrc: '/collapse.svg',
          width: 16,
          height: 16,
          collapsedAlt: 'Show filters',
          expandedAlt: 'Hide filters',
          initialExpanded: this.showFilters_,
          onToggle: (expanded) => {
            this.showFilters_ = expanded
            this.updateShape_()
          },
        }), 'SHOW_FILTERS_TOGGLE')

      this.appendStatementInput('FILTER_STACK')
        .appendField('with')

      Blockly.Extensions.apply('mc_trim_chain_tail', this, false)

      this.updateShape_()
    },

    updateShape_(this: TargetSelectorBlock) {
      this.getInput('FILTER_STACK')?.setVisible(this.showFilters_)
      if (this.rendered) {
        this.render()
      }
    },

    saveExtraState(this: TargetSelectorBlock) {
      return this.showFilters_ ? { showFilters: true } : null
    },

    loadExtraState(this: TargetSelectorBlock, state: { showFilters?: boolean } | null) {
      this.showFilters_ = !!state?.showFilters
      const toggleField = this.getField('SHOW_FILTERS_TOGGLE')
      if (toggleField instanceof ToggleImageField) {
        toggleField.setExpanded(this.showFilters_)
      }
      this.updateShape_()
    },
  }
}

const targetSelectors: any[] = [
  // Basic
  {
    "type": "mc_target_filter_limit",
    "tooltip": "",
    "helpUrl": "",
    "message0": "limit %1",
    "args0": [
      {
        "type": "field_input",
        "name": "LIMIT",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_sort",
    "tooltip": "",
    "helpUrl": "",
    "message0": "sort by %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "SORT",
        "options": [
          ["increasing distance", "nearest"],
          ["decreasing distance", "furthest"],
          ["random", "random"],
          ["arbitrary", "arbitrary"]
        ]
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },

  // Position
  {
    "type": "mc_target_filter_position",
    "tooltip": "",
    "helpUrl": "",
    "message0": "position x %1 y %2 z %3",
    "args0": [
      {
        "type": "field_input",
        "name": "X",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "Y",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "Z",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_distance",
    "tooltip": "",
    "helpUrl": "",
    "message0": "radius min %1 max %2",
    "args0": [
      {
        "type": "field_input",
        "name": "MIN",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "MAX",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_volume",
    "tooltip": "",
    "helpUrl": "",
    "message0": "volume dx %1 dy %2 dz %3",
    "args0": [
      {
        "type": "field_input",
        "name": "DX",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "DY",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "DZ",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_vert_rot",
    "tooltip": "",
    "helpUrl": "",
    "message0": "vertical rotation min %1 max %2",
    "args0": [
      {
        "type": "field_input",
        "name": "MIN",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "MAX",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_hori_rot",
    "tooltip": "",
    "helpUrl": "",
    "message0": "horizontal rotation min %1 max %2",
    "args0": [
      {
        "type": "field_input",
        "name": "MIN",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "MAX",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },

  // Entity information
  {
    "type": "mc_target_filter_type",
    "tooltip": "",
    "helpUrl": "",
    "message0": "entity type %1",
    "args0": [  // TODO replace with dropdown
      {
        "type": "field_input",
        "name": "TYPE",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_name",
    "tooltip": "",
    "helpUrl": "",
    "message0": "entity name %1",
    "args0": [
      {
        "type": "field_input",
        "name": "NAME",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  { // TODO custom interface
    "type": "mc_target_filter_predicates",
    "tooltip": "",
    "helpUrl": "",
    "message0": "predicates %1",
    "args0": [
      {
        "type": "field_input",
        "name": "PREDICATE",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  { // TODO custom interface
    "type": "mc_target_filter_nbt",
    "tooltip": "",
    "helpUrl": "",
    "message0": "NBT data %1",
    "args0": [
      {
        "type": "field_input",
        "name": "NBT",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },

  // Scoreboard
  { // TODO custom interface
    "type": "mc_target_filter_scores",
    "tooltip": "",
    "helpUrl": "",
    "message0": "scores %1",
    "args0": [
      {
        "type": "field_input",
        "name": "SCORES",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  { // TODO custom interface
    "type": "mc_target_filter_tags",
    "tooltip": "",
    "helpUrl": "",
    "message0": "tags %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TAG",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_team",
    "tooltip": "",
    "helpUrl": "",
    "message0": "team %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TEAM",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },

  // Player
  {
    "type": "mc_target_filter_xp",
    "tooltip": "",
    "helpUrl": "",
    "message0": "xp min %1 max %2",
    "args0": [
      {
        "type": "field_input",
        "name": "MIN",
        "text": ""
      },
      {
        "type": "field_input",
        "name": "MAX",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  {
    "type": "mc_target_filter_gamemode",
    "tooltip": "",
    "helpUrl": "",
    "message0": "gamemode %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "GAMEMODE",
        "options": [
          ["survival", "survival"],
          ["creative", "creative"],
          ["adventure", "adventure"],
          ["spectator", "spectator"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
  { // TODO custom interface
    "type": "mc_target_filter_advancements",
    "tooltip": "",
    "helpUrl": "",
    "message0": "advancements %1",
    "args0": [
      {
        "type": "field_input",
        "name": "ADVANCEMENTS",
        "text": ""
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true
  },
]

export default targetSelectors
