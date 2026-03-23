import { addFile } from '../fileRegistry'
import { mcfunctionGenerator } from '../generator'
import { nextId } from '../idGenerator'
import { getProjectConfig } from '../projectConfig'
import { scoreboardManager } from '../scoreboardManager'

const opMap: Record<string, string> = {
  LT: '<',
  LTE: '<=',
  EQ: '=',
  GTE: '>=',
  GT: '>'
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
  const varB = scoreboardManager.getVarName(block.getField('VAR_B')!.getText())
  const obj = scoreboardManager.getObjectiveName()
  const op = opMap[block.getFieldValue('OP')]
  return [`score ${varA} ${obj} ${op} ${varB} ${obj}`, 0]
}

mcfunctionGenerator.forBlock['mc_if'] = function(block) {
  const id = nextId('if')
  const condition = mcfunctionGenerator.valueToCode(block, 'CONDITION', 0)
  const doCode = mcfunctionGenerator.statementToCode(block, 'DO')
  const { namespace } = getProjectConfig()

  addFile(`data/${namespace}/function/internal/${id}_true.mcfunction`, doCode)

  return `execute if ${condition} run function ${namespace}:internal/${id}_true\n`
}

mcfunctionGenerator.forBlock['mc_if_else'] = function(block) {
  const id = nextId('if')
  const condition = mcfunctionGenerator.valueToCode(block, 'CONDITION', 0)
  const doCode = mcfunctionGenerator.statementToCode(block, 'DO')
  const elseCode = mcfunctionGenerator.statementToCode(block, 'ELSE')
  const { namespace } = getProjectConfig()

  addFile(`data/${namespace}/function/internal/${id}_true.mcfunction`, doCode)
  addFile(`data/${namespace}/function/internal/${id}_false.mcfunction`, elseCode)

  return `execute if ${condition} run function ${namespace}:internal/${id}_true\n`
       + `execute unless ${condition} run function ${namespace}:internal/${id}_false\n`
}