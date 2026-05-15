import {ConstantRegistry} from './constantRegistry.ts'
import {ProcedureRegistry} from './procedureRegistry.ts'
import {VariableRegistry} from './variableRegistry.ts'

export {Registry} from './Registry.ts'
export type {RegistryEvent, RegistryEventType, RegistryListener, RegistryOptions} from './Registry.ts'
export {ConstantRegistry} from './constantRegistry.ts'
export {ProcedureRegistry} from './procedureRegistry.ts'
export {VariableRegistry} from './variableRegistry.ts'
export type {
  ConstantRegistryEntry,
  ConstantValueType,
  ProcedureParameterRegistryEntry,
  ProcedureRegistryEntry,
  VariableRegistryEntry,
  VariableValueType,
} from './types.ts'

export interface BlocklyWorkspaceRegistrySystem {
  constants: ConstantRegistry
  variables: VariableRegistry
  procedures: ProcedureRegistry
}

export function createBlocklyWorkspaceRegistrySystem(): BlocklyWorkspaceRegistrySystem {
  return {
    constants: new ConstantRegistry(),
    variables: new VariableRegistry(),
    procedures: new ProcedureRegistry(),
  }
}

const blocklyWorkspaceRegistry = createBlocklyWorkspaceRegistrySystem()
export const constantRegistry = blocklyWorkspaceRegistry.constants
export const variableRegistry = blocklyWorkspaceRegistry.variables
export const procedureRegistry = blocklyWorkspaceRegistry.procedures
