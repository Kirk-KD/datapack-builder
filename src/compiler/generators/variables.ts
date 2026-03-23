import { mcfunctionGenerator } from "../generator"
import { scoreboardManager } from '../scoreboardManager'

mcfunctionGenerator.forBlock['mc_var_set'] = function(block) {
  const varName = scoreboardManager.getVarName(block.getField('VAR')!.getText())
  const obj = scoreboardManager.getObjectiveName()
  const valueBlock = block.getInputTargetBlock('VALUE')!

  let cmd: string

  if (valueBlock.type === 'mc_var_get') {
    const srcName = scoreboardManager.getVarName(valueBlock.getField('VAR')!.getText())
    cmd = `scoreboard players operation ${varName} ${obj} = ${srcName} ${obj}\n`
  } else {
    cmd = `scoreboard players set ${varName} ${obj} ${valueBlock.getFieldValue('NUM')}\n`
  }

  return scoreboardManager.withObjective(cmd)
}

mcfunctionGenerator.forBlock['mc_var_change'] = function(block) {
  const varName = scoreboardManager.getVarName(block.getField('VAR')!.getText())
  const obj = scoreboardManager.getObjectiveName()
  const opType = block.getFieldValue('OP')
  const valueBlock = block.getInputTargetBlock('VALUE')!
  const isLiteral = valueBlock.type === 'math_number'
  const num = isLiteral ? valueBlock.getFieldValue('NUM') : null
  const srcName = !isLiteral ? scoreboardManager.getVarName(valueBlock.getField('VAR')!.getText()) : null

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

  return scoreboardManager.withObjective(cmd)
}

mcfunctionGenerator.forBlock['mc_var_get'] = function(block) {
  return scoreboardManager.getVarName(block.getField('VAR')!.getText())
}