import {
  constantRegistry,
  type ConstantRegistryEntry, type ConstantValueType,
  type ProcedureParameterRegistryEntry, procedureRegistry,
  type ProcedureRegistryEntry,
  type VariableRegistryEntry
} from '../blockly/registry'

export type RegistryReferenceOption<T extends RegistryReferenceType = RegistryReferenceType> =
  | (T extends 'variable' ? { type: 'variable'; entry: VariableRegistryEntry } : never)
  | (T extends 'constant' ? { type: 'constant'; entry: ConstantRegistryEntry } : never)
  | (T extends 'procedure' ? { type: 'procedure'; entry: ProcedureRegistryEntry } : never)
  | (T extends 'parameter' ? { type: 'parameter'; entry: ProcedureParameterRegistryEntry } : never)

export type RegistryReferenceType = 'variable' | 'constant' | 'procedure' | 'parameter'

export function getConstantsOfType(type: ConstantValueType): RegistryReferenceOption<'constant'>[] {
  return constantRegistry
    .filter(entry => entry.valueType === type)
    .map(entry => ({
      type: 'constant',
      entry
    }))
}

// TODO filter by parent procedure
export function getParameters(): RegistryReferenceOption<'parameter'>[] {
  return procedureRegistry
    .listParameters()
    .map(entry => ({
      type: 'parameter',
      entry
    }))
}
