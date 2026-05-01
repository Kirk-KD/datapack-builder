import {Registry} from './Registry.ts'
import type {VariableRegistryEntry, VariableValueType} from './types.ts'

export class VariableRegistry extends Registry<VariableRegistryEntry> {
  constructor() {
    super({
      getEntryId: (entry) => entry.id,
    })
  }

  createEntry(name: string, valueType: VariableValueType, id?: string): VariableRegistryEntry {
    const entryId = id ?? crypto.randomUUID()

    return {
      id: entryId,
      name,
      valueType,
    }
  }
}
