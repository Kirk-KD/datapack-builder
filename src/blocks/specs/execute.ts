import * as Blockly from 'blockly'
import { addFile } from '../../compiler/fileRegistry'
import { mcfunctionGenerator } from '../../compiler/generator'
import { nextId } from '../../compiler/idGenerator'
import { getInternalNamespace } from '../../compiler/projectConfig'
import type { BlockSpec } from './types'

const INPUT_MODIFIER_STACK = 'MODIFIER_STACK'
const INPUT_RUN_STACK = 'RUN_STACK'
const INPUT_TARGET = 'TARGET'

function targetInput(check?: string[]) {
  return {
    type: 'input_value',
    name: INPUT_TARGET,
    ...(check ? { check } : {}),
  }
}

function scalarModifierSpec(
  type: string,
  message0: string,
  args0: Record<string, unknown>[],
  generator: (block: Blockly.Block) => string,
  jsonExtras: Record<string, unknown> = {},
): BlockSpec {
  return {
    type,
    category: 'execute',
    codeKind: 'fragment',
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
  }
}

export const executeBlockSpecs: BlockSpec[] = [
  {
    type: 'execute_root',
    category: 'execute',
    codeKind: 'fragment',
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
  scalarModifierSpec(
    'execute_mod_align',
    'align %1',
    [{ type: 'field_input', name: 'AXES', text: 'xyz' }],
    block => `align ${block.getFieldValue('AXES')} `,
  ),
  scalarModifierSpec(
    'execute_mod_anchored',
    'anchored %1',
    [{
      type: 'field_dropdown',
      name: 'ANCHOR',
      options: [['eyes', 'eyes'], ['feet', 'feet']],
    }],
    block => `anchored ${block.getFieldValue('ANCHOR')} `,
  ),
  scalarModifierSpec(
    'execute_mod_as',
    'as %1',
    [targetInput(['mc_string', 'mc_target_selector'])],
    block => `as ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    { extensions: ['execute_mod_as_shadow'] },
  ),
  scalarModifierSpec(
    'execute_mod_at',
    'at %1',
    [targetInput(['mc_string', 'mc_target_selector'])],
    block => `at ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    { extensions: ['execute_mod_at_shadow'] },
  ),
  scalarModifierSpec(
    'execute_mod_facing',
    'facing %1 %2 %3',
    [
      { type: 'field_input', name: 'X', text: '0' },
      { type: 'field_input', name: 'Y', text: '0' },
      { type: 'field_input', name: 'Z', text: '0' },
    ],
    block => `facing ${block.getFieldValue('X')} ${block.getFieldValue('Y')} ${block.getFieldValue('Z')} `,
  ),
  scalarModifierSpec(
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
    { extensions: ['execute_mod_facing_entity_shadow'] },
  ),
  scalarModifierSpec(
    'execute_mod_in',
    'in %1',
    [{ type: 'field_input', name: 'DIMENSION', text: 'minecraft:overworld' }],
    block => `in ${block.getFieldValue('DIMENSION')} `,
  ),
  scalarModifierSpec(
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
  scalarModifierSpec(
    'execute_mod_positioned',
    'positioned %1 %2 %3',
    [
      { type: 'field_input', name: 'X', text: '0' },
      { type: 'field_input', name: 'Y', text: '0' },
      { type: 'field_input', name: 'Z', text: '0' },
    ],
    block => `positioned ${block.getFieldValue('X')} ${block.getFieldValue('Y')} ${block.getFieldValue('Z')} `,
  ),
  scalarModifierSpec(
    'execute_mod_positioned_as',
    'positioned as %1',
    [targetInput()],
    block => `positioned as ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    { extensions: ['execute_mod_positioned_as_shadow'] },
  ),
  scalarModifierSpec(
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
  scalarModifierSpec(
    'execute_mod_rotated',
    'rotated %1 %2',
    [
      { type: 'field_input', name: 'YAW', text: '0' },
      { type: 'field_input', name: 'PITCH', text: '0' },
    ],
    block => `rotated ${block.getFieldValue('YAW')} ${block.getFieldValue('PITCH')} `,
  ),
  scalarModifierSpec(
    'execute_mod_rotated_as',
    'rotated as %1',
    [targetInput(['mc_string', 'mc_target_selector'])],
    block => `rotated as ${(mcfunctionGenerator.valueToCode(block, INPUT_TARGET, 0) || '').trim()} `,
    { extensions: ['execute_mod_rotated_as_shadow'] },
  ),
  scalarModifierSpec(
    'execute_mod_summon',
    'summon %1',
    [{ type: 'field_input', name: 'ENTITY', text: 'armor_stand' }],
    block => `summon ${block.getFieldValue('ENTITY')} `,
  ),
]
