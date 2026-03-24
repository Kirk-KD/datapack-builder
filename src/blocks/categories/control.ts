import * as Blockly from 'blockly'

export default function getControlCategory(workspace?: Blockly.WorkspaceSvg) {
  const firstVar = workspace?.getVariableMap().getAllVariables()[0]
  if (!firstVar) return [
    { kind: 'block', type: 'mc_if' },
    { kind: 'block', type: 'mc_if_else' },
    { kind: 'block', type: 'mc_while' },
  ]
  
  const name = firstVar.getName()
  return [
    { kind: 'block', type: 'mc_comp_score_matches', fields: { VAR: { name, type: '' } } },
    { kind: 'block', type: 'mc_comp_score_compare', fields: { VAR_A: { name, type: '' } } },
    { kind: 'block', type: 'mc_if' },
    { kind: 'block', type: 'mc_if_else' },
    { kind: 'block', type: 'mc_while' },
  ]
}