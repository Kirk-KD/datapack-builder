import { mcfunctionGenerator } from '../generator'
import { scoreboardManager } from '../scoreboardManager'
import { getInternalNamespace } from '../projectConfig'
import { literalChain, snbtToString } from '../util'
import { literalBlocks } from '../../blocks/definitions'
import { nbtStorageManager } from '../nbtStorageManager'

mcfunctionGenerator.forBlock['procedures_defnoreturn'] = function(block) {
  const body = mcfunctionGenerator.statementToCode(block, 'STACK')
  return body
}

mcfunctionGenerator.forBlock['procedures_callnoreturn'] = function(block) {
  const procName = block.getFieldValue('NAME')
  const params: string[] = block.getVars() ?? []
  const internalNs = getInternalNamespace()
  const storageName = nbtStorageManager.getProcArgsStorageName()

  let cmd = ''

  // literals can be passed directly in-line as SNBT
  const snbt: Record<string, string> = {}

  let cmdHasMacro = false
  let cmdHasStorage = false

  params.forEach((param: string, i: number) => {
    const argBlock = block.getInputTargetBlock(`ARG${i}`)
    
    if (!argBlock) {
      // TODO: handle missing/default args
      snbt[param] = ''
      return
    }

    if (argBlock.type === 'mc_var_get') {
      const objectiveName = scoreboardManager.getObjectiveName()
      const varName = scoreboardManager.getVarName(argBlock.getFieldValue('VAR_NAME'))
      const paramPath = nbtStorageManager.getProcArgPath(procName, param)
      cmd += `execute store result storage ${storageName} ${paramPath} int 1 run scoreboard players get ${varName} ${objectiveName}\n`
      cmdHasStorage = true
    } else if ([...literalBlocks, 'mc_param'].includes(argBlock.type)) {
      const [text, argHasMacro] = literalChain(argBlock)
      snbt[param] = text
      cmdHasMacro ||= argHasMacro
    }
  })

  if (cmdHasMacro) cmd += '$'
  cmd += `function ${internalNs}:proc_${procName}`
  if (Object.keys(snbt).length > 0) cmd += ` ${snbtToString(snbt)}`
  if (cmdHasStorage) cmd += ` with storage ${storageName}`
  cmd += '\n'

  return cmd
}

mcfunctionGenerator.forBlock['mc_param'] = function(block) {
  const [text, _] = literalChain(block)
  return [text, 0]
}