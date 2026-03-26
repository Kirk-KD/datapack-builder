import * as Blockly from 'blockly'

let variables: Blockly.IVariableModel<Blockly.IVariableState>[] = []
let procedures: Blockly.Procedures.IProcedureModel[] = []

export type ProcedureParameterPair = readonly [
  Blockly.Procedures.IProcedureModel,
  Blockly.Procedures.IParameterModel[],
]

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

export function getParameters(): ProcedureParameterPair[] {
  return procedures.map((proc) => [proc, proc.getParameters()] as const)
}

export function getParametersForProcedure(procedureName: string): Blockly.Procedures.IParameterModel[] {
  const pair = getParameters().find(([proc]) => proc.getName() === procedureName)
  return pair?.[1] ?? []
}