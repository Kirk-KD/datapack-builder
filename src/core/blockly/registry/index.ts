import {ProcedureRegistry} from './procedureRegistry.ts'
import {VariableRegistry} from './variableRegistry.ts'

export {Registry} from './Registry.ts'
export type {RegistryEvent, RegistryEventType, RegistryListener, RegistryOptions} from './Registry.ts'
export {ProcedureRegistry} from './procedureRegistry.ts'
export {VariableRegistry} from './variableRegistry.ts'
export type {
  ProcedureParameterRegistryEntry,
  ProcedureRegistryEntry,
  VariableRegistryEntry,
  VariableValueType,
} from './types.ts'

export interface BlocklyWorkspaceRegistrySystem {
  variables: VariableRegistry
  procedures: ProcedureRegistry
}

export function createBlocklyWorkspaceRegistrySystem(): BlocklyWorkspaceRegistrySystem {
  return {
    variables: new VariableRegistry(),
    procedures: new ProcedureRegistry(),
  }
}

const blocklyWorkspaceRegistry = createBlocklyWorkspaceRegistrySystem()
export const variableRegistry = blocklyWorkspaceRegistry.variables
export const procedureRegistry = blocklyWorkspaceRegistry.procedures
