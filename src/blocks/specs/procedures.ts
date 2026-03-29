import { mcfunctionGenerator } from '../../compiler/generator'
import { nbtStorageManager } from '../../compiler/nbtStorageManager'
import { getInternalNamespace } from '../../compiler/projectConfig'
import { scoreboardManager } from '../../compiler/scoreboardManager'
import { literalChain, snbtToString } from '../../compiler/util'
import type { BlockSpec } from './types'

const FIELD_PARAM_NAME = 'PARAM_NAME'
const INPUT_CHAIN_NEXT = 'CHAIN_NEXT'
const chainableChecks = ['mc_string', 'mc_int', 'mc_param', 'mc_target_selector']
const inlineProcedureArgTypes = new Set(['mc_string', 'mc_int', 'mc_param'])

export const procedureBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_param',
    category: 'procedures',
    codeKind: 'value',
    tags: ['chainable', 'procArg', 'scoreboardVarSet'],
    json: {
      type: 'mc_param',
      tooltip: '',
      helpUrl: '',
      message0: '%1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: FIELD_PARAM_NAME,
          options: [['myParam', 'X']],
        },
        {
          type: 'input_value',
          name: INPUT_CHAIN_NEXT,
          check: chainableChecks,
        },
      ],
      output: 'mc_param',
      extensions: ['mc_procedure_parameter_dropdown', 'mc_trim_chain_tail'],
    },
    generator(block) {
      const [text] = literalChain(block)
      return [text, 0]
    },
  },
  {
    type: 'procedures_defnoreturn',
    category: 'procedures',
    codeKind: 'command',
    generator(block) {
      return mcfunctionGenerator.statementToCode(block, 'STACK')
    },
  },
  {
    type: 'procedures_callnoreturn',
    category: 'procedures',
    codeKind: 'command',
    generator(block) {
      const procName = block.getFieldValue('NAME')
      const params: string[] = block.getVars() ?? []
      const internalNs = getInternalNamespace()
      const storageName = nbtStorageManager.getProcArgsStorageName()

      let cmd = ''
      const snbt: Record<string, string> = {}
      let cmdHasMacro = false
      let cmdHasStorage = false

      params.forEach((param: string, i: number) => {
        const argBlock = block.getInputTargetBlock(`ARG${i}`)

        if (!argBlock) {
          snbt[param] = ''
          return
        }

        if (argBlock.type === 'mc_var_get') {
          const objectiveName = scoreboardManager.getObjectiveName()
          const varName = scoreboardManager.getVarName(argBlock.getFieldValue('VAR_NAME'))
          const paramPath = nbtStorageManager.getProcArgPath(procName, param)
          cmd += `execute store result storage ${storageName} ${paramPath} int 1 run scoreboard players get ${varName} ${objectiveName}\n`
          cmdHasStorage = true
        } else if (inlineProcedureArgTypes.has(argBlock.type)) {
          const [text, argHasMacro] = literalChain(argBlock)
          snbt[param] = text
          cmdHasMacro ||= argHasMacro
        }
      })

      if (cmdHasMacro) cmd += '$'
      cmd += `function ${internalNs}:proc_${procName}`
      if (Object.keys(snbt).length > 0) cmd += ` ${snbtToString(snbt)}`
      if (cmdHasStorage) cmd += ' with storage ' + storageName
      cmd += '\n'

      return cmd
    },
  },
]
