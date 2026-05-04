import type {VariableValueType} from './registry'

export type CreateParamData = {
  name: string
  type: VariableValueType
}
export type CreateProcedureData = {
  name: string
  params: CreateParamData[]
}

export type CreateVariableData = {
  name: string
  valueType: VariableValueType
}

export interface WorkspaceCallbacks {
  onCreateProcedure(onConfirm: (data: CreateProcedureData) => void): void
  onCreateVariable(onConfirm: (data: CreateVariableData) => void): void
}
