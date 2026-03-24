import * as Blockly from 'blockly'
import { addFile } from '../fileRegistry'
import { mcfunctionGenerator } from '../generator'
import { nextId } from '../idGenerator'
import { getInternalNamespace } from '../projectConfig'
import { scoreboardManager } from '../scoreboardManager'

const opMap: Record<string, string> = {
  LT: '<',
  LTE: '<=',
  EQ: '=',
  GTE: '>=',
  GT: '>'
}

export function getConditionSetup(conditionBlock: Blockly.Block): string {
  if (conditionBlock.type === 'mc_comp_score_compare') {
    const valueBBlock = conditionBlock.getInputTargetBlock('VAR_B')
    if (valueBBlock?.type === 'mc_int') {
      const num = valueBBlock.getFieldValue('VALUE')
      const tempName = scoreboardManager.getTempVar()
      const obj = scoreboardManager.getObjectiveName()
      const cmd = `scoreboard players set ${tempName} ${obj} ${num}\n`
      return scoreboardManager.withObjective(cmd)
    }
  }
  return ''
}

mcfunctionGenerator.forBlock['mc_comp_score_matches'] = function(block) {
  const varName = scoreboardManager.getVarName(block.getField('VAR')!.getText())
  const obj = scoreboardManager.getObjectiveName()
  const min = block.getFieldValue('MIN')
  const max = block.getFieldValue('MAX')
  return [`score ${varName} ${obj} matches ${min}..${max}`, 0]
}

mcfunctionGenerator.forBlock['mc_comp_score_compare'] = function(block) {
  const varA = scoreboardManager.getVarName(block.getField('VAR_A')!.getText())
  const obj = scoreboardManager.getObjectiveName()
  const op = opMap[block.getFieldValue('OP')]
  const valueBBlock = block.getInputTargetBlock('VAR_B')!

  let fragment: string

  if (valueBBlock.type === 'mc_int') {
    const tempName = scoreboardManager.getTempVar()
    fragment = `score ${varA} ${obj} ${op} ${tempName} ${obj}`
  } else {
    const varB = scoreboardManager.getVarName(valueBBlock.getField('VAR')!.getText())
    fragment = `score ${varA} ${obj} ${op} ${varB} ${obj}`
  }

  return [fragment, 0]
}

mcfunctionGenerator.forBlock['mc_if'] = function(block) {
  const id = nextId('if')
  const conditionBlock = block.getInputTargetBlock('CONDITION')!
  const setup = getConditionSetup(conditionBlock)
  const condition = mcfunctionGenerator.valueToCode(block, 'CONDITION', 0)
  const doCode = mcfunctionGenerator.statementToCode(block, 'DO')
  const internalNs = getInternalNamespace()

  addFile(`data/${internalNs}/function/${id}_true.mcfunction`, doCode)

  return setup
       + `execute if ${condition} run function ${internalNs}:${id}_true\n`
}

mcfunctionGenerator.forBlock['mc_if_else'] = function(block) {
  const id = nextId('if')
  const conditionBlock = block.getInputTargetBlock('CONDITION')!
  const setup = getConditionSetup(conditionBlock)
  const condition = mcfunctionGenerator.valueToCode(block, 'CONDITION', 0)
  const doCode = mcfunctionGenerator.statementToCode(block, 'DO')
  const elseCode = mcfunctionGenerator.statementToCode(block, 'ELSE')
  const internalNs = getInternalNamespace()

  addFile(`data/${internalNs}/function/${id}_true.mcfunction`, doCode)
  addFile(`data/${internalNs}/function/${id}_false.mcfunction`, elseCode)

  return setup
       + `execute if ${condition} run function ${internalNs}:${id}_true\n`
       + `execute unless ${condition} run function ${internalNs}:${id}_false\n`
}

mcfunctionGenerator.forBlock['mc_while'] = function(block) {
  const id = nextId('while')
  const conditionBlock = block.getInputTargetBlock('CONDITION')!
  const setup = getConditionSetup(conditionBlock)
  const condition = mcfunctionGenerator.valueToCode(block, 'CONDITION', 0)
  const bodyCode = mcfunctionGenerator.statementToCode(block, 'DO')
  const internalNs = getInternalNamespace()

  addFile(
    `data/${internalNs}/function/${id}.mcfunction`,
    `execute if ${condition} run function ${internalNs}:${id}_body\n`
  )

  addFile(
    `data/${internalNs}/function/${id}_body.mcfunction`,
    bodyCode
    + setup
    + `function ${internalNs}:${id}\n`
  )

  return setup
       + `function ${internalNs}:${id}\n`
}