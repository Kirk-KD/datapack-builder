import * as Blockly from 'blockly'

export default function getVariablesCategory(workspace: Blockly.WorkspaceSvg) {
  const vars = workspace.getVariableMap().getAllVariables()
  
  const createButton = {
    kind: 'button',
    text: 'Create variable',
    callbackKey: 'CREATE_VARIABLE'
  }

  if (vars.length === 0) return [createButton]
  
  const firstName = vars[0].getName()
  return [
    createButton,
    { kind: 'block', type: 'mc_var_set', fields: { VAR: { name: firstName, type: '' } } },
    { kind: 'block', type: 'mc_var_change', fields: { VAR: { name: firstName, type: '' } } },
    { kind: 'block', type: 'mc_var_get', fields: { VAR: { name: firstName, type: '' } } },
  ]
}