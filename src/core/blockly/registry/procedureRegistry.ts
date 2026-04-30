import {Registry} from './Registry.ts'
import type {ProcedureParameterRegistryEntry, ProcedureRegistryEntry, VariableValueType} from './types.ts'

export class ProcedureRegistry extends Registry<ProcedureRegistryEntry> {
  constructor() {
    super({
      getEntryId: (entry) => entry.id,
    })
  }

  createEntry(
    name: string,
    parameters: Array<Omit<ProcedureParameterRegistryEntry, 'procedureId'>>,
    id?: string,
  ): ProcedureRegistryEntry {
    const procedureId = id ?? crypto.randomUUID()

    return {
      id: procedureId,
      name,
      parameters: parameters.map((parameter) => ({
        ...parameter,
        immutable: true,
        procedureId,
      })),
    }
  }

  addProcedure(
    name: string,
    parameters: Array<Omit<ProcedureParameterRegistryEntry, 'procedureId'>>,
    id?: string,
  ): ProcedureRegistryEntry {
    return this.add(this.createEntry(name, parameters, id))
  }

  createParameter(name: string, valueType: VariableValueType, id?: string): Omit<ProcedureParameterRegistryEntry, 'procedureId'> {
    const parameterId = id ?? crypto.randomUUID()

    return {
      id: parameterId,
      name,
      valueType,
    }
  }

  listParameters(): ProcedureParameterRegistryEntry[] {
    return this.list().flatMap((procedure) => procedure.parameters)
  }

  findParameterById(parameterId: string): ProcedureParameterRegistryEntry | undefined {
    return this.listParameters().find((parameter) => parameter.id === parameterId)
  }

  listParametersForProcedure(procedureId: string): ProcedureParameterRegistryEntry[] {
    return this.findById(procedureId)?.parameters ?? []
  }

  addParameter(
    procedureId: string,
    parameter: Omit<ProcedureParameterRegistryEntry, 'procedureId'>,
  ): ProcedureRegistryEntry {
    const procedure = this.findById(procedureId)

    if (!procedure) {
      throw new Error(`Cannot add parameter to procedure "${procedureId}" because it does not exist`)
    }

    const updatedProcedure: ProcedureRegistryEntry = {
      ...procedure,
      parameters: [
        ...procedure.parameters,
        {
          ...parameter,
          procedureId,
        },
      ],
    }

    this.update(updatedProcedure)

    return updatedProcedure
  }

  removeParameter(procedureId: string, parameterId: string): ProcedureRegistryEntry {
    const procedure = this.findById(procedureId)

    if (!procedure) {
      throw new Error(`Cannot remove parameter from procedure "${procedureId}" because it does not exist`)
    }

    const updatedProcedure: ProcedureRegistryEntry = {
      ...procedure,
      parameters: procedure.parameters.filter((parameter) => parameter.id !== parameterId),
    }

    this.update(updatedProcedure)

    return updatedProcedure
  }
}
