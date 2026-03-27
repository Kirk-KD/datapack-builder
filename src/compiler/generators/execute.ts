import { mcfunctionGenerator } from '../generator'

mcfunctionGenerator.forBlock['execute_root'] = function(block) {
  const modString = mcfunctionGenerator.statementToCode(block, 'MODIFIER_STACK').trim()
  const runStringRaw = mcfunctionGenerator.statementToCode(block, 'RUN_STACK')
  const code = runStringRaw.trim().split('\n').map(line => `execute ${modString} run ${line}`).join('\n') + '\n'
  return code
}

mcfunctionGenerator.forBlock['execute_mod_align'] = function(block) {
  const axes = block.getFieldValue('AXES') // TODO: validator
  return `align ${axes} `
}

mcfunctionGenerator.forBlock['execute_mod_anchored'] = function(block) {
  const anchor = block.getFieldValue('ANCHOR')
  return `anchored ${anchor} `
}

mcfunctionGenerator.forBlock['execute_mod_as'] = function(block) {
  const target = block.getFieldValue('TARGET')
  return `as ${target} `
}

mcfunctionGenerator.forBlock['execute_mod_at'] = function(block) {
  const target = block.getFieldValue('TARGET')
  return `at ${target} `
}

mcfunctionGenerator.forBlock['execute_mod_facing'] = function(block) {
  const x = block.getFieldValue('X')
  const y = block.getFieldValue('Y')
  const z = block.getFieldValue('Z')
  return `facing ${x} ${y} ${z} `
}

mcfunctionGenerator.forBlock['execute_mod_facing_entity'] = function(block) {
  const target = block.getFieldValue('TARGET')
  const anchor = block.getFieldValue('ANCHOR')
  return `facing entity ${target} ${anchor} `
}

mcfunctionGenerator.forBlock['execute_mod_in'] = function(block) {
  const dimension = block.getFieldValue('DIMENSION')
  return `in ${dimension} `
}

mcfunctionGenerator.forBlock['execute_mod_on'] = function(block) {
  const relation = block.getFieldValue('RELATION')
  return `on ${relation} `
}

mcfunctionGenerator.forBlock['execute_mod_positioned'] = function(block) {
  const x = block.getFieldValue('X')
  const y = block.getFieldValue('Y')
  const z = block.getFieldValue('Z')
  return `positioned ${x} ${y} ${z} `
}

mcfunctionGenerator.forBlock['execute_mod_positioned_as'] = function(block) {
  const target = block.getFieldValue('TARGET')
  return `positioned as ${target} `
}

mcfunctionGenerator.forBlock['execute_mod_positioned_over'] = function(block) {
  const heightmap = block.getFieldValue('HEIGHTMAP')
  return `positioned over ${heightmap} `
}

mcfunctionGenerator.forBlock['execute_mod_rotated'] = function(block) {
  const yaw = block.getFieldValue('YAW')
  const pitch = block.getFieldValue('PITCH')
  return `rotated ${yaw} ${pitch} `
}

mcfunctionGenerator.forBlock['execute_mod_rotated_as'] = function(block) {
  const target = block.getFieldValue('TARGET')
  return `rotated as ${target} `
}

mcfunctionGenerator.forBlock['execute_mod_summon'] = function(block) {
  const entity = block.getFieldValue('ENTITY')
  return `summon ${entity} `
}