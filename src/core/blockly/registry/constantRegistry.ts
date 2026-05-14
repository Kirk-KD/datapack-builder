import {Registry} from './Registry.ts'
import type {ConstantRegistryEntry, ConstantValueType} from './types.ts'

export class ConstantRegistry extends Registry<ConstantRegistryEntry> {
  constructor() {
    super({
      getEntryId: (entry) => entry.name,
    })
  }

  createEntry(name: string, valueType: ConstantValueType): ConstantRegistryEntry {
    return {
      name,
      valueType,
    }
  }
}
