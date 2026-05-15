import type {ConstantValueType, VariableValueType} from './registry'

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

export type CreateConstantData = {
  name: string
  valueType: ConstantValueType
}

export interface WorkspaceCallbacks {
  onCreateProcedure(onConfirm: (data: CreateProcedureData) => void): void
  onCreateVariable(onConfirm: (data: CreateVariableData) => void): void
  onCreateConstant(onConfirm: (data: CreateConstantData) => void): void
}
