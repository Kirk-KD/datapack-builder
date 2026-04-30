export type VariableValueType = 'integer'

export interface VariableRegistryEntry {
  id: string
  name: string
  valueType: VariableValueType
}

export interface ProcedureParameterRegistryEntry {
  id: string
  name: string
  valueType: VariableValueType
  procedureId: string
}

export interface ProcedureRegistryEntry {
  id: string
  name: string
  parameters: ProcedureParameterRegistryEntry[]
}
