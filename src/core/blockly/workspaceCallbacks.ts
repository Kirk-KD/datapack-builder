import type {VariableValueType} from './registry'

export type CreateParamData = {
  name: string
  type: VariableValueType
}
export type CreateProcedureData = {
  name: string
  params: CreateParamData[]
}

export interface WorkspaceCallbacks {
  onCreateProcedure(onConfirm: (data: CreateProcedureData) => void): void
}
