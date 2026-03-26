import { getParameters, getVariables } from "../../compiler/workspaceRegistry"
import type Blockly from 'blockly'

export default function getVariablesCategory(_: Blockly.WorkspaceSvg) {
  const vars = getVariables().filter(v => v.getType() === 'mc_scoreboard_variable')
  const procedureParameters = getParameters()
  const hasAnyProcedureParams = procedureParameters.some(([, params]) => params.length > 0)

  const createButton = {
    kind: 'button',
    text: 'Create variable',
    callbackKey: 'CREATE_VARIABLE'
  }

  if (vars.length === 0) return [createButton]

  const blocks: any[] = [
    createButton,
    { kind: 'block', type: 'mc_var_set' },
    { kind: 'block', type: 'mc_var_change' },
    { kind: 'block', type: 'mc_var_get' }
  ]

  if (hasAnyProcedureParams) {
    blocks.push({ kind: 'block', type: 'mc_param' })
  }

  return blocks
}