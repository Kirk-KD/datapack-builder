import { getParameters, getVariables } from "../../compiler/workspaceRegistry"
import type Blockly from 'blockly'

export default function getVariablesCategory(_: Blockly.WorkspaceSvg) {
  const vars = getVariables().filter(v => v.getType() === 'mc_scoreboard_variable')
  const params = getParameters()

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

  if (params.length !== 0) {
    blocks.push({ kind: 'block', type: 'mc_param' })
  }

  return blocks
}