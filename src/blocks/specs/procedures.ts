import { mcfunctionGenerator } from '../../compiler/generator'
import { snbtToString } from '../../compiler/util'
import { getParameterNameById } from '../../compiler/workspaceRegistry'
import type { BlockSpec } from './types'
import {
  getInternalNamespace,
  getObjectiveName, getProcArgPath,
  getProcArgsStorageName,
  getVarName
} from "../../compiler/nameManager.ts";

const FIELD_PARAM_NAME = 'PARAM_NAME'
export const PROC_DEF_NAME = 'procedures_defnoreturn'

export const procedureBlockSpecs: BlockSpec[] = [
  {
    type: 'mc_param',
    category: 'procedures',
    tags: ['procArg', 'scoreboardVarSet'],
    json: {
      type: 'mc_param',
      tooltip: '',
      helpUrl: '',
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: FIELD_PARAM_NAME,
          options: [['myParam', 'X']],
        },
      ],
      output: 'mc_param',
      extensions: ['mc_procedure_parameter_dropdown'],
    },
    generator(block) {
      const paramValue = block.getFieldValue(FIELD_PARAM_NAME) as string
      const paramName = getParameterNameById(paramValue) ?? paramValue
      return [`$(${paramName})`, 0]
    },
  },
  {
    type: PROC_DEF_NAME,
    category: 'procedures',
    generator(block) {
      return mcfunctionGenerator.statementToCode(block, 'STACK')
    },
  },
  {
    type: 'procedures_callnoreturn',
    category: 'procedures',
    generator(block) {
      const procName = block.getFieldValue('NAME')
      const params: string[] = block.getVars() ?? []
      const internalNs = getInternalNamespace()
      const storageName = getProcArgsStorageName()

      let cmd = ''
      const snbt: Record<string, string> = {}
      let cmdHasStorage = false

      params.forEach((param: string, i: number) => {
        const argBlock = block.getInputTargetBlock(`ARG${i}`)

        if (!argBlock) {
          snbt[param] = ''
          return
        }

        if (argBlock.type === 'mc_var_get') {
          const objectiveName = getObjectiveName()
          const varName = getVarName(argBlock.getFieldValue('VAR_NAME'))
          const paramPath = getProcArgPath(procName, param)
          cmd += `execute store result storage ${storageName} ${paramPath} int 1 run scoreboard players get ${varName} ${objectiveName}\n`
          cmdHasStorage = true
        } else {
          const [text] = mcfunctionGenerator.blockToCode(argBlock) as [string, number]
          snbt[param] = text
        }
      })

      cmd += `function ${internalNs}:proc_${procName}`
      if (Object.keys(snbt).length > 0) cmd += ` ${snbtToString(snbt)}`
      if (cmdHasStorage) cmd += ' with storage ' + storageName
      cmd += '\n'

      return cmd
    },
  },
]
