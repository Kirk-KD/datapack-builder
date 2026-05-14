export type VariableValueType = 'int'  // Variables are restrictive on purpose; might add float in the future, but use
                                       // only int for now.

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

export type ConstantValueType = 'int' | 'string' | 'position'  // Add more later, entities etc.

export interface ConstantRegistryEntry {
  name: string
  valueType: ConstantValueType
}
