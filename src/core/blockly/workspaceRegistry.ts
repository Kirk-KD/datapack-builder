import * as Blockly from 'blockly'
import {WorkspaceSvg} from "blockly";

let variables: Blockly.IVariableModel<Blockly.IVariableState>[] = []
let procedures: Blockly.Procedures.IProcedureModel[] = []

export type ProcedureParameterPair = readonly [
  Blockly.Procedures.IProcedureModel,
  Blockly.Procedures.IParameterModel[],
]

export function updateWorkspaceRegistry(workspace: WorkspaceSvg) {
  updateVariables(workspace.getVariableMap().getAllVariables())
  // Also update procedures when a parameter is renamed (VAR_RENAME fires for param renames)
  updateProcedures(workspace.getProcedureMap().getProcedures())
}

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

export function getParameterNameById(parameterId: string): string | null {
  for (const proc of procedures) {
    const found = proc.getParameters().find((param) => param.getId() === parameterId)
    if (found) return found.getName()
  }

  return null
}