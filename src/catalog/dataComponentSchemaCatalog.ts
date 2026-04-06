import { createCatalog } from './createCatalog'

export type DataComponentScalarType =
  | 'string'
  | 'boolean'
  | 'byte'
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'int_array'
  | 'byte_array'

export type DataComponentScalarSchema = {
  kind: 'scalar'
  type: DataComponentScalarType
  semantic_type?: string
  description?: string
  default?: unknown
  choices?: unknown[]
  min?: number
  max?: number
}

export type DataComponentObjectField = {
  key: string
  schema: DataComponentValueSchema
}

export type DataComponentObjectSchema = {
  kind: 'object'
  fields: DataComponentObjectField[]
  description?: string
  default?: unknown
  choices?: unknown[]
  min?: number
  max?: number
}

export type DataComponentMapSchema = {
  kind: 'map'
  key: DataComponentScalarSchema & { type: 'string' }
  value: DataComponentValueSchema
  description?: string
  default?: unknown
  choices?: unknown[]
  min?: number
  max?: number
}

export type DataComponentListSchema = {
  kind: 'list'
  item: DataComponentValueSchema
  description?: string
  default?: unknown
  choices?: unknown[]
  min?: number
  max?: number
}

export type DataComponentUnionSchema = {
  kind: 'union'
  options: DataComponentValueSchema[]
  description?: string
  default?: unknown
  choices?: unknown[]
  min?: number
  max?: number
}

export type DataComponentReferenceSchema = {
  kind: 'reference'
  ref: string
  semantic_type?: string
  description?: string
  default?: unknown
  choices?: unknown[]
  min?: number
  max?: number
}

export type DataComponentOpaqueSchema = {
  kind: 'opaque'
  description?: string
  default?: unknown
  choices?: unknown[]
  min?: number
  max?: number
}

export type DataComponentValueSchema =
  | DataComponentScalarSchema
  | DataComponentObjectSchema
  | DataComponentMapSchema
  | DataComponentListSchema
  | DataComponentUnionSchema
  | DataComponentReferenceSchema
  | DataComponentOpaqueSchema

export type DataComponentSchemaEntry = {
  id: string
  label: string
  value_schema: DataComponentValueSchema
}

type DataComponentSchemaDocument = {
  schema_version: number
  source: {
    page: string
    html_file: string
  }
  components: DataComponentSchemaEntry[]
}

const dataComponentSchemaCatalog = createCatalog({
  loadRaw: () =>
    import('../data/minecraft/data_component_schema.json').then(
      ({ default: schema }) => schema as DataComponentSchemaDocument,
    ),
  toEntries: (schema) => schema.components,
  getKey: (entry: DataComponentSchemaEntry) => entry.id,
})

export function loadDataComponentSchemas() {
  return dataComponentSchemaCatalog.loadEntries()
}

export function getDataComponentSchemaById(componentId: string) {
  return dataComponentSchemaCatalog.getByKey(componentId)
}
