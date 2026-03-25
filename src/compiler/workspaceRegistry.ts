import * as Blockly from 'blockly'

let variables: Blockly.IVariableModel<Blockly.IVariableState>[] = []
let procedures: Blockly.Procedures.IProcedureModel[] = []

export function updateVariables(newVars: Blockly.IVariableModel<Blockly.IVariableState>[]) {
  variables = newVars
}

export function getVariables() {
  return variables
}

export function updateProcedures(newProcs: Blockly.Procedures.IProcedureModel[]) {
  procedures = newProcs
}

export function getProcedures() {
  return procedures
}

export function getParameters() {
  return procedures.flatMap(proc => proc.getParameters())
}