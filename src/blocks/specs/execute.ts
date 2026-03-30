import * as Blockly from 'blockly'
import { colours } from '../blockColours'
import { addFile } from '../../compiler/fileRegistry'
import { mcfunctionGenerator } from '../../compiler/generator'
import { nextId } from '../../compiler/idGenerator'
import { getInternalNamespace } from '../../compiler/projectConfig'
import type { BlockSpec } from './types'
import { setShadowState } from '../extensions/shadows.ts'

const INPUT_MODIFIER_STACK = 'MODIFIER_STACK'
const INPUT_RUN_STACK = 'RUN_STACK'
const INPUT_TARGET = 'TARGET'
const FIELD_CONDITION_KIND = 'CONDITION_KIND'
const FIELD_MODE = 'MODE'

/**
 * Builds a standard TARGET value input config for execute modifier specs.
 */
function targetInput(check?: string[]) {
  return {
    type: 'input_value',
    name: INPUT_TARGET,
    ...(check ? { check } : {}),
  }
}

/**
 * Creates a standard BlockSpec for execute modifier fragments that share the same JSON shape.
 */
function executeModifierSpec(
  type: string,
  message0: string,
  args0: Record<string, unknown>[],
  generator: (block: Blockly.Block) => string,
  jsonExtras: Record<string, unknown> = {},
  setShadowBlocks?: (this: Blockly.Block) => void,
): BlockSpec {
  return {
    type,
    category: 'execute',
    tags: ['executeModifier'],
    json: {
      type,
      tooltip: '',
      helpUrl: '',
      message0,
      args0,
      previousStatement: null,
      nextStatement: null,
      ...jsonExtras,
    },
    generator,
    setShadowBlocks,
  }
}

type ExecuteConditionMode = 'biome' | 'block' | 'blocks' | 'data' | 'dimension' | 'entity' | 'function' | 'items'
  | 'loaded' | 'predicate' | 'score'

type ExecuteConditionDataKind = 'block' | 'entity' | 'storage'

type ExecuteConditionBlock = Blockly.BlockSvg & {
  conditionKind_: 'if' | 'unless'
  mode_: ExecuteConditionMode
  dataKind_: ExecuteConditionDataKind
  updateShape_: () => void
}

/**
 * An `execute (if|unless)`'s input argument.
 */
type ExecuteConditionInputConfig =
  | {
    kind: 'value'
    name: string
    check?: string | string[]
  }
  | {
    kind: 'field_input'
    name: string
    text: string
  }
  | {
    kind: 'field_dropdown'
    name: string
    options: [string, string][]
  }

/**
 * A config for message, arguments, and partial code generation in execute conditions.
 */
type ExecuteConditionConfig = {
  message: string
  args: ExecuteConditionInputConfig[]
  partialGenerator: (block: Blockly.Block) => string
  customAppender?: (block: ExecuteConditionBlock, args: ExecuteConditionInputConfig[]) => void
  inputsInline?: boolean
}

/**
 * Partial specs for arguments of `execute (if|unless) <mode> <arguments>`.
 */
const executeConditionModeConfigs: Record<ExecuteConditionMode, ExecuteConditionConfig> = {
  biome: {
    message: 'at %1 is %2',
    args: [
      { kind: 'value', name: 'POS', check: ['mc_block_pos', 'mc_param'] },
      { kind: 'field_input', name: 'BIOME', text: 'minecraft:plains' },
    ],
    partialGenerator(block) {
      return [
        mcfunctionGenerator.valueToCode(block, 'POS', 0),
        block.getFieldValue('BIOME')
      ].join(' ')
    },
  },
  block: {
    message: 'at %1 is %2',
    args: [
      { kind: 'value', name: 'POS', check: ['mc_block_pos', 'mc_param'] },
      { kind: 'field_input', name: 'BLOCK', text: 'minecraft:stone' },
    ],
    partialGenerator(block) {
      return `${mcfunctionGenerator.valueToCode(block, 'POS', 0)} ${block.getFieldValue('BLOCK')}`
    },
  },
  blocks: {
    message: '',
    inputsInline: false,
    args: [
      { kind: 'value', name: 'START_POS', check: ['mc_block_pos', 'mc_param'] },
      { kind: 'value', name: 'END_POS', check: ['mc_block_pos', 'mc_param'] },
      { kind: 'value', name: 'DEST_POS', check: ['mc_block_pos', 'mc_param'] },
      { kind: 'field_dropdown', name: 'SCAN_MODE', options: [
        ['all blocks', 'all'],
        ['non-air blocks', 'masked'],
      ] },
    ],
    partialGenerator(block) {
      return [
        mcfunctionGenerator.valueToCode(block, 'START_POS', 0),
        mcfunctionGenerator.valueToCode(block, 'END_POS', 0),
        mcfunctionGenerator.valueToCode(block, 'DEST_POS', 0),
        block.getFieldValue('SCAN_MODE'),
      ].join(' ')
    },
    customAppender(block, args) {
      appendExecuteConditionArg(block, args[0], 'from')
      appendExecuteConditionArg(block, args[1], 'to')
      appendExecuteConditionArg(block, args[2], 'compare with')
      appendExecuteConditionArg(block, args[3], 'using')
    },
  },
  data: { // Defined via mutator
    message: '',
    args: [],
    partialGenerator() {
      return ''
    },
  },
  dimension: {
    message: 'is in %1',
    args: [
      { kind: 'field_input', name: 'DIMENSION', text: 'minecraft:overworld' },
    ],
    partialGenerator(block) {
      return String(block.getFieldValue('DIMENSION'))
    },
  },
  entity: {
    message: '%1 exists',
    args: [
      { kind: 'value', name: INPUT_TARGET, check: ['mc_string', 'mc_target_selector'] },
    ],
    partialGenerator(block) {
      return mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0)
    },
  },
  function: {
    message: '%1 returns non-zero',
    args: [
      { kind: 'field_input', name: 'FUNCTION', text: 'namespace:path' },
    ],
    partialGenerator(block) {
      return block.getFieldValue('FUNCTION')
    },
  },
  items: { // TODO implement `items`
    message: '%1',
    args: [
      { kind: 'field_input', name: 'X', text: '' },
    ],
    partialGenerator(block) {
      return `placeholder ${block.getFieldValue('X')}`
    },
  },
  loaded: {
    message: 'at %1',
    args: [
      { kind: 'value', name: 'POS', check: ['mc_block_pos', 'mc_param'] },
    ],
    partialGenerator(block) {
      return String(mcfunctionGenerator.valueToCode(block, 'POS', 0))
    },
  },
  predicate: {
    message: '%1',
    args: [
      { kind: 'field_input', name: 'PREDICATE', text: '{}' },
    ],
    partialGenerator(block) {
      return block.getFieldValue('PREDICATE')
    },
  },
  score: { // TODO implement `score`
    message: '%1',
    args: [{ kind: 'field_input', name: 'X', text: '' }],
    partialGenerator(block) {
      return `placeholder ${block.getFieldValue('X')}`
    },
  },
}

const executeConditionDataKindConfigs: Record<ExecuteConditionDataKind, ExecuteConditionConfig> = {
  block: {
    message: 'at %1 has %2',
    args: [
      { kind: 'value', name: 'POS', check: ['mc_block_pos', 'mc_param'] },
      { kind: 'field_input', name: 'PATH', text: '' },
    ],
    partialGenerator(block) {
      return `block ${mcfunctionGenerator.valueToCode(block, 'POS', 0)} ${block.getFieldValue('PATH')}`
    },
  },
  entity: {
    message: '%1 has %2',
    args: [
      { kind: 'value', name: INPUT_TARGET, check: ['mc_string', 'mc_target_selector'] },
      { kind: 'field_input', name: 'PATH', text: '' },
    ],
    partialGenerator(block) {
      return `entity ${mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0)} ${block.getFieldValue('PATH')}`
    },
  },
  storage: {
    message: '%1 has %2',
    args: [
      { kind: 'field_input', name: 'SOURCE', text: '' },
      { kind: 'field_input', name: 'PATH', text: '' },
    ],
    partialGenerator(block) {
      return `storage ${block.getFieldValue('SOURCE')} ${block.getFieldValue('PATH')}`
    },
  },
}

/**
 * Splits a Blockly-style message string into the text segments around each placeholder.
 */
function getMessageSegments(message: string, expectedArgs: number): string[] {
  const segments = message.split(/%\d+/)
  if (segments.length !== expectedArgs + 1) {
    throw new Error(`Execute condition message "${message}" does not match arg count ${expectedArgs}`)
  }
  return segments
}

/**
 * Appends inputs and fields for a message/config pair onto the block.
 */
function appendExecuteConditionInputs(
  block: ExecuteConditionBlock,
  message: string,
  args: ExecuteConditionInputConfig[],
  onFirstInput?: (input: Blockly.Input) => void,
) {
  const segments = getMessageSegments(message, args.length)

  args.forEach((inputConfig, index) => {
    let input: Blockly.Input

    if (inputConfig.kind === 'value') {
      input = block.appendValueInput(inputConfig.name)
      input.setCheck(inputConfig.check ?? null)
    } else {
      input = block.appendDummyInput(inputConfig.name)
    }

    if (index === 0) {
      onFirstInput?.(input)
    }

    const prefix = segments[index].trim()
    if (prefix !== '') {
      input.appendField(prefix)
    }

    if (inputConfig.kind === 'field_input') {
      input.appendField(new Blockly.FieldTextInput(inputConfig.text), inputConfig.name)
    } else if (inputConfig.kind === 'field_dropdown') {
      input.appendField(new Blockly.FieldDropdown(inputConfig.options), inputConfig.name)
    }
  })

  const suffix = segments.at(-1)?.trim() ?? ''
  if (suffix !== '') {
    const lastInput = block.inputList.at(-1)
    if (lastInput) {
      lastInput.appendField(suffix)
    }
  }
}

/**
 * Appends a single configured execute-condition argument with an optional leading label.
 */
function appendExecuteConditionArg(
  block: ExecuteConditionBlock,
  inputConfig: ExecuteConditionInputConfig,
  prefix?: string,
) {
  let input: Blockly.Input

  if (inputConfig.kind === 'value') {
    input = block.appendValueInput(inputConfig.name)
    input.setCheck(inputConfig.check ?? null)
  } else {
    input = block.appendDummyInput(inputConfig.name)
  }

  if (prefix) {
    input.appendField(prefix)
  }

  if (inputConfig.kind === 'field_input') {
    input.appendField(new Blockly.FieldTextInput(inputConfig.text), inputConfig.name)
  } else if (inputConfig.kind === 'field_dropdown') {
    input.appendField(new Blockly.FieldDropdown(inputConfig.options), inputConfig.name)
  }
}

export const executeBlockSpecs: BlockSpec[] = [
  {
    type: 'execute_root',
    category: 'execute',
    json: {
      type: 'execute_root',
      tooltip: '',
      helpUrl: '',
      message0: 'execute %1 run %2',
      args0: [
        {
          type: 'input_statement',
          name: INPUT_MODIFIER_STACK,
        },
        {
          type: 'input_statement',
          name: INPUT_RUN_STACK,
        },
      ],
      previousStatement: null,
      nextStatement: null,
    },
    generator(block) {
      const modString = mcfunctionGenerator.statementToCode(block, INPUT_MODIFIER_STACK).trim()
      const runString = mcfunctionGenerator.statementToCode(block, INPUT_RUN_STACK)
      const internalNs = getInternalNamespace()
      const id = nextId('execute')

      addFile(`data/${internalNs}/function/${id}.mcfunction`, runString)

      if (modString === '') {
        return `function ${internalNs}:${id}\n`
      }

      return `execute ${modString} run function ${internalNs}:${id}\n`
    },
  },
  {
    type: 'execute_condition',
    category: 'execute',
    tags: ['executeModifier'],
    init(this: Blockly.Block) {
      const block = this as ExecuteConditionBlock
      block.conditionKind_ = 'if'
      block.mode_ = 'biome'
      block.dataKind_ = 'block'
      block.setPreviousStatement(true)
      block.setNextStatement(true)
      block.setColour(colours.execute)
      block.setTooltip('')
      block.setHelpUrl('')
      block.setInputsInline(true)

      block.updateShape_ = function(this: ExecuteConditionBlock) {
        this.inputList
          .filter(input => input.name !== '')
          .forEach(input => this.removeInput(input.name))

        const modeField = new Blockly.FieldDropdown(
          Object.keys(executeConditionModeConfigs).map(key => [key, key]),
          (newMode) => {
            if (!newMode || newMode === block.mode_) return newMode
            block.mode_ = newMode as ExecuteConditionMode
            block.updateShape_()
            return newMode
          }
        )
        const conditionKindField = new Blockly.FieldDropdown(
          [['if', 'if'], ['unless', 'unless']],
          (newConditionKind) => {
            if (!newConditionKind || newConditionKind === block.conditionKind_) return newConditionKind
            block.conditionKind_ = newConditionKind as 'if' | 'unless'
            return newConditionKind
          }
        )

        const config = executeConditionModeConfigs[this.mode_]
        this.setInputsInline(config.inputsInline ?? true)
        const dataKindField = new Blockly.FieldDropdown(
          [['block', 'block'], ['entity', 'entity'], ['storage', 'storage']],
          (newDataKind) => {
            if (!newDataKind || newDataKind === block.dataKind_) return newDataKind
            block.dataKind_ = newDataKind as ExecuteConditionDataKind
            block.updateShape_()
            return newDataKind
          }
        )

        if (this.mode_ === 'data') {
          const headerInput = this.appendDummyInput('HEADER')
          headerInput.appendField(conditionKindField, FIELD_CONDITION_KIND).appendField(modeField, FIELD_MODE)
        } else {
          if (config.customAppender) {
            const headerInput = this.appendDummyInput('HEADER')
            headerInput.appendField(conditionKindField, FIELD_CONDITION_KIND).appendField(modeField, FIELD_MODE)
            config.customAppender(this, config.args)
          } else {
            appendExecuteConditionInputs(this, config.message, config.args, (input) => {
              input.appendField(conditionKindField, FIELD_CONDITION_KIND).appendField(modeField, FIELD_MODE)
            })
          }
        }

        if (this.mode_ === 'data') {
          const firstDataInput = this.appendDummyInput('DATA_KIND_ROW')
          firstDataInput.appendField(dataKindField, 'DATA_KIND')

          const dataConfig = executeConditionDataKindConfigs[this.dataKind_]
          appendExecuteConditionInputs(this, dataConfig.message, dataConfig.args)
          dataKindField.setValue(this.dataKind_)
        }

        conditionKindField.setValue(this.conditionKind_)
        modeField.setValue(this.mode_)

        if (this.mode_ === 'biome' || this.mode_ === 'block' || this.mode_ === 'loaded') {
          setShadowState(this, 'POS', { type: 'mc_block_pos' })
        } else if (this.mode_ === 'blocks') {
          setShadowState(this, 'START_POS', { type: 'mc_block_pos' })
          setShadowState(this, 'END_POS', { type: 'mc_block_pos' })
          setShadowState(this, 'DEST_POS', { type: 'mc_block_pos' })
        } else if (this.mode_ === 'entity') {
          setShadowState(this, INPUT_TARGET, { type: 'mc_target_selector' })
        } else if (this.mode_ === 'data') {
          if (this.dataKind_ === 'block') {
            setShadowState(this, 'POS', { type: 'mc_block_pos' })
          } else if (this.dataKind_ === 'entity') {
            setShadowState(this, INPUT_TARGET, { type: 'mc_target_selector' })
          }
        }
      }

      block.saveExtraState = function(this: ExecuteConditionBlock) {
        return { conditionKind: this.conditionKind_, mode: this.mode_, dataKind: this.dataKind_ }
      }

      block.loadExtraState = function(this: ExecuteConditionBlock, state: {
        conditionKind?: 'if' | 'unless'
        mode?: ExecuteConditionMode
        dataKind?: ExecuteConditionDataKind
      } | null) {
        this.conditionKind_ = state?.conditionKind ?? 'if'
        this.mode_ = state?.mode ?? 'biome'
        this.dataKind_ = state?.dataKind ?? 'block'
        this.updateShape_()
      }

      block.updateShape_()
    },
    generator(block) {
      const conditionKind = block.getFieldValue(FIELD_CONDITION_KIND) as 'if' | 'unless'
      const mode = block.getFieldValue(FIELD_MODE) as ExecuteConditionMode
      const suffix = mode === 'data'
        ? executeConditionDataKindConfigs[(block as ExecuteConditionBlock).dataKind_].partialGenerator(block)
        : executeConditionModeConfigs[mode].partialGenerator(block)
      return `${conditionKind} ${mode} ${suffix} `
    }
  },
  executeModifierSpec(
    'execute_mod_align',
    'align %1',
    [{ type: 'input_value', name: 'AXES', check: ['swizzle'] }],
    block => `align ${mcfunctionGenerator.valueToCode(block, 'AXES', 0)} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, 'AXES', { type: 'swizzle' })
    },
  ),
  executeModifierSpec(
    'execute_mod_anchored',
    'anchored %1',
    [{
      type: 'field_dropdown',
      name: 'ANCHOR',
      options: [['eyes', 'eyes'], ['feet', 'feet']],
    }],
    block => `anchored ${block.getFieldValue('ANCHOR')} `,
  ),
  executeModifierSpec(
    'execute_mod_as',
    'as %1',
    [targetInput(['mc_string', 'mc_target_selector'])],
    block => `as ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, INPUT_TARGET, { type: 'mc_target_selector' })
    },
  ),
  executeModifierSpec(
    'execute_mod_at',
    'at %1',
    [targetInput(['mc_string', 'mc_target_selector'])],
    block => `at ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, INPUT_TARGET, { type: 'mc_target_selector' })
    },
  ),
  executeModifierSpec(
    'execute_mod_facing',
    'facing %1',
    [{ type: 'input_value', name: 'POS', check: ['mc_block_pos', 'mc_param'] }],
    block => `facing ${mcfunctionGenerator.valueToCode(block, 'POS', 0)} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, 'POS', { type: 'mc_block_pos' })
    },
  ),
  executeModifierSpec(
    'execute_mod_facing_entity',
    'facing entity %1 %2',
    [
      targetInput(['mc_string', 'mc_target_selector']),
      {
        type: 'field_dropdown',
        name: 'ANCHOR',
        options: [['eyes', 'eyes'], ['feet', 'feet']],
      },
    ],
    block => `facing entity ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} ${block.getFieldValue('ANCHOR')} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, INPUT_TARGET, { type: 'mc_target_selector' })
    },
  ),
  executeModifierSpec(
    'execute_mod_in',
    'in %1',
    [{ type: 'field_input', name: 'DIMENSION', text: 'minecraft:overworld' }],
    block => `in ${block.getFieldValue('DIMENSION')} `,
  ),
  executeModifierSpec(
    'execute_mod_on',
    'on %1',
    [{
      type: 'field_dropdown',
      name: 'RELATION',
      options: [
        ['attacker', 'attacker'],
        ['controller', 'controller'],
        ['leasher', 'leasher'],
        ['origin', 'origin'],
        ['owner', 'owner'],
        ['passengers', 'passengers'],
        ['target', 'target'],
        ['vehicle', 'vehicle'],
      ],
    }],
    block => `on ${block.getFieldValue('RELATION')} `,
  ),
  executeModifierSpec(
    'execute_mod_positioned',
    'positioned %1',
    [{ type: 'input_value', name: 'POS', check: ['mc_block_pos', 'mc_param'] }],
    block => `positioned ${mcfunctionGenerator.valueToCode(block, 'POS', 0)} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, 'POS', { type: 'mc_block_pos' })
    },
  ),
  executeModifierSpec(
    'execute_mod_positioned_as',
    'positioned as %1',
    [targetInput()],
    block => `positioned as ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, INPUT_TARGET, { type: 'mc_target_selector' })
    },
  ),
  executeModifierSpec(
    'execute_mod_positioned_over',
    'positioned over %1',
    [{
      type: 'field_dropdown',
      name: 'HEIGHTMAP',
      options: [
        ['world_surface', 'world_surface'],
        ['motion_blocking', 'motion_blocking'],
        ['motion_blocking_no_leaves', 'motion_blocking_no_leaves'],
        ['ocean_floor', 'ocean_floor'],
      ],
    }],
    block => `positioned over ${block.getFieldValue('HEIGHTMAP')} `,
  ),
  executeModifierSpec(
    'execute_mod_rotated',
    'rotated %1',
    [{ type: 'input_value', name: 'ROTATION', check: ['mc_rotation', 'mc_param'] }],
    block => `rotated ${mcfunctionGenerator.valueToCode(block, 'ROTATION', 0)} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, 'ROTATION', { type: 'mc_rotation' })
    },
  ),
  executeModifierSpec(
    'execute_mod_rotated_as',
    'rotated as %1',
    [targetInput(['mc_string', 'mc_target_selector'])],
    block => `rotated as ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    {},
    function(this: Blockly.Block) {
      setShadowState(this, INPUT_TARGET, { type: 'mc_target_selector' })
    },
  ),
  executeModifierSpec(
    'execute_mod_summon',
    'summon %1',
    [{ type: 'field_input', name: 'ENTITY', text: 'armor_stand' }],
    block => `summon ${block.getFieldValue('ENTITY')} `,
  ),
]
