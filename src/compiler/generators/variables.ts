import { mcfunctionGenerator } from "../generator"
import { scoreboardManager } from '../scoreboardManager'
import { getConditionSetup } from "./control"
import { markNoExecCtx } from '../executeContext'

function isConditionBlock(type: string): boolean {
  return type.startsWith('mc_comp_')
}

mcfunctionGenerator.forBlock['mc_var_set'] = function(block) {
  const varName = scoreboardManager.getVarName(block.getField('VAR_NAME')!.getText())
  const obj = scoreboardManager.getObjectiveName()
  const valueBlock = block.getInputTargetBlock('VALUE')!

  let cmd: string

  if (isConditionBlock(valueBlock.type)) {
    const setup = getConditionSetup(valueBlock)
    const condition = mcfunctionGenerator.valueToCode(block, 'VALUE', 0)
    cmd = setup
        + `execute if ${condition} run scoreboard players set ${varName} ${obj} 1\n`
        + `execute unless ${condition} run scoreboard players set ${varName} ${obj} 0\n`
  } else if (valueBlock.type === 'mc_var_get') {
    const srcName = mcfunctionGenerator.valueToCode(block, 'VALUE', 0)
    cmd = `scoreboard players operation ${varName} ${obj} = ${srcName} ${obj}\n`
  } else if (valueBlock.type === 'mc_int') {
    const valueCode = mcfunctionGenerator.blockToCode(valueBlock)[0]
    cmd = `scoreboard players set ${varName} ${obj} ${valueCode}\n`
  } else cmd = ''

  return markNoExecCtx(scoreboardManager.withObjective(cmd))
}

mcfunctionGenerator.forBlock['mc_var_change'] = function(block) {
  const varName = scoreboardManager.getVarName(block.getField('VAR_NAME')!.getText())
  const obj = scoreboardManager.getObjectiveName()
  const opType = block.getFieldValue('OP')
  const valueBlock = block.getInputTargetBlock('VALUE')!
  const isLiteral = valueBlock.type === 'mc_int'
  const num = isLiteral ? valueBlock.getFieldValue('VALUE') : null
  const srcName = !isLiteral ? mcfunctionGenerator.valueToCode(block, 'VALUE', 0) : null

  let cmd: string

  if (isLiteral && opType === 'ADD') {
    cmd = `scoreboard players add ${varName} ${obj} ${num}\n`
  } else if (isLiteral && opType === 'SUB') {
    cmd = `scoreboard players remove ${varName} ${obj} ${num}\n`
  } else if (isLiteral) {
    const opMap: Record<string, string> = { MUL: '*=', DIV: '/=', MOD: '%=' }
    const tempName = scoreboardManager.getTempVar()
    cmd = `scoreboard players set ${tempName} ${obj} ${num}\n`
        + `scoreboard players operation ${varName} ${obj} ${opMap[opType]} ${tempName} ${obj}\n`
  } else {
    const opMap: Record<string, string> = { ADD: '+=', SUB: '-=', MUL: '*=', DIV: '/=', MOD: '%=' }
    cmd = `scoreboard players operation ${varName} ${obj} ${opMap[opType]} ${srcName} ${obj}\n`
  }

  return markNoExecCtx(scoreboardManager.withObjective(cmd))
}

mcfunctionGenerator.forBlock['mc_var_get'] = function(block) {
  const name = block.getField('VAR_NAME')!.getText()
  return [scoreboardManager.getVarName(name), 0]
}