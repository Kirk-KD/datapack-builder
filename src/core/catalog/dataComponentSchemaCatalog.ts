import { createCatalog } from './createCatalog'
import type {EditorSchema} from "../editor";

export type DataComponentSchemaEntry = {
  id: string
  value_schema: EditorSchema
}

const dataComponentSchemaCatalog = createCatalog({
  loadRaw: () =>
    import('../../data/minecraft/data_component_schema.json').then(
      ({ default: schema }) => schema as DataComponentSchemaEntry[],
    ),
  toEntries: (schema) => schema,
  getKey: (entry: DataComponentSchemaEntry) => entry.id,
})

export function loadDataComponentSchemas() {
  return dataComponentSchemaCatalog.loadEntries()
}

export function getDataComponentSchemaById(componentId: string) {
  return dataComponentSchemaCatalog.getByKey(componentId)
}
