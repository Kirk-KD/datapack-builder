import * as Blockly from 'blockly'
import { mcfunctionGenerator } from '../generator'

/**
 * Build the filter string for a selector (e.g., "[limit=5,sort=nearest]")
 */
function getFilterString(block: Blockly.Block): string {
  const filterStack = mcfunctionGenerator.statementToCode(block, 'FILTER_STACK') || ''
  const filters = filterStack.trim().split(',').filter((f: string) => f.length > 0)
  return filters.length > 0 ? `[${filters.join(',')}]` : ''
}

/**
 * Compile a selector block to its full string value including filters.
 * This is used when a selector is part of a literal chain.
 */
export function compileSelector(block: Blockly.Block): string {
  const baseTarget = block.getFieldValue('BASE')
  const filterStr = getFilterString(block)
  return baseTarget + filterStr
}

mcfunctionGenerator.forBlock['mc_target_selector'] = function(block) {
  const selectorStr = compileSelector(block)
  
  // Check if there's a chained block and continue the chain
  const nextBlock = block.getInputTargetBlock('CHAIN_NEXT')
  const nextStr = nextBlock ? mcfunctionGenerator.blockToCode(nextBlock)[0] : ''
  
  return [selectorStr + nextStr, 0]
}

mcfunctionGenerator.forBlock['mc_target_filter_limit'] = function(block) {
  const limit = block.getFieldValue('LIMIT')
  return `limit=${limit},`
}

mcfunctionGenerator.forBlock['mc_target_filter_sort'] = function(block) {
  const sort = block.getFieldValue('SORT')
  return `sort=${sort},`
}

mcfunctionGenerator.forBlock['mc_target_filter_position'] = function(block) {
  const x = block.getFieldValue('X')
  const y = block.getFieldValue('Y')
  const z = block.getFieldValue('Z')
  return `x=${x},y=${y},z=${z},`
}

mcfunctionGenerator.forBlock['mc_target_filter_distance'] = function(block) {
  const min = block.getFieldValue('MIN')
  const max = block.getFieldValue('MAX')
  return `distance=${min}..${max},`
}

mcfunctionGenerator.forBlock['mc_target_filter_volume'] = function(block) {
  const dx = block.getFieldValue('DX')
  const dy = block.getFieldValue('DY')
  const dz = block.getFieldValue('DZ')
  return `dx=${dx},dy=${dy},dz=${dz},`
}

mcfunctionGenerator.forBlock['mc_target_filter_vert_rot'] = function(block) {
  const min = block.getFieldValue('MIN')
  const max = block.getFieldValue('MAX')
  return `x_rotation=${min}..${max},`
}

mcfunctionGenerator.forBlock['mc_target_filter_hori_rot'] = function(block) {
  const min = block.getFieldValue('MIN')
  const max = block.getFieldValue('MAX')
  return `y_rotation=${min}..${max},`
}

mcfunctionGenerator.forBlock['mc_target_filter_type'] = function(block) {
  const type = block.getFieldValue('TYPE')
  return `type=${type},`
}

mcfunctionGenerator.forBlock['mc_target_filter_name'] = function(block) {
  const name = block.getFieldValue('NAME')
  return `name=${name},`
}

mcfunctionGenerator.forBlock['mc_target_filter_predicates'] = function(block) {
  const predicate = block.getFieldValue('PREDICATE')
  return `predicate=${predicate},`
}

mcfunctionGenerator.forBlock['mc_target_filter_nbt'] = function(block) {
  const nbt = block.getFieldValue('NBT')
  return `nbt=${nbt},`
}

mcfunctionGenerator.forBlock['mc_target_filter_scores'] = function(block) {
  const scores = block.getFieldValue('SCORES')
  return `scores=${scores},`
}

mcfunctionGenerator.forBlock['mc_target_filter_tags'] = function(block) {
  const tag = block.getFieldValue('TAG')
  return `tag=${tag},`
}

mcfunctionGenerator.forBlock['mc_target_filter_team'] = function(block) {
  const team = block.getFieldValue('TEAM')
  return `team=${team},`
}

mcfunctionGenerator.forBlock['mc_target_filter_xp'] = function(block) {
  const min = block.getFieldValue('MIN')
  const max = block.getFieldValue('MAX')
  return `level=${min}..${max},`
}

mcfunctionGenerator.forBlock['mc_target_filter_gamemode'] = function(block) {
  const gamemode = block.getFieldValue('GAMEMODE')
  return `gamemode=${gamemode},`
}

mcfunctionGenerator.forBlock['mc_target_filter_advancements'] = function(block) {
  const advancements = block.getFieldValue('ADVANCEMENTS')
  return `advancements=${advancements},`
}
