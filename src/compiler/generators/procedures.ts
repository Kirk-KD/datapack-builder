import { mcfunctionGenerator } from '../generator'
import { scoreboardManager } from '../scoreboardManager'
import { getInternalNamespace } from '../projectConfig'
import { setProcedureContext, clearProcedureContext } from '../procedureContext'

mcfunctionGenerator.forBlock['procedures_defnoreturn'] = function(block) {
  const procName = block.getFieldValue('NAME')
  const params: string[] = block.getVars() ?? []

  setProcedureContext(procName, params)
  const body = mcfunctionGenerator.statementToCode(block, 'STACK')
  clearProcedureContext()

  return body
}

mcfunctionGenerator.forBlock['procedures_callnoreturn'] = function(block) {
  const procName = block.getFieldValue('NAME')
  const params: string[] = block.getVars() ?? []
  const internalNs = getInternalNamespace()
  const obj = scoreboardManager.getObjectiveName()

  let cmd = ''

  params.forEach((param: string, i: number) => {
    const argBlock = block.getInputTargetBlock(`ARG${i}`)
    if (!argBlock) {
      cmd += `scoreboard players set ${scoreboardManager.getScopedArgName(procName, param)} ${obj} 0\n`
      return
    }
    if (argBlock.type === 'mc_var_get') {
      const srcName = scoreboardManager.getVarName(argBlock.getField('VAR')!.getText())
      cmd += `scoreboard players operation ${scoreboardManager.getScopedArgName(procName, param)} ${obj} = ${srcName} ${obj}\n`
    } else if (argBlock.type === 'mc_int') {
      const num = argBlock.getFieldValue('VALUE')
      cmd += `scoreboard players set ${scoreboardManager.getScopedArgName(procName, param)} ${obj} ${num}\n`
    }
  })

  cmd += `function ${internalNs}:proc_${procName}\n`

  return params.length > 0 ? scoreboardManager.withObjective(cmd) : cmd
}