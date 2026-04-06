import type {
  DataComponentReferenceSchema,
  DataComponentScalarSchema,
  DataComponentSchemaEntry,
  DataComponentValueSchema,
} from '../../../catalog/dataComponentSchemaCatalog'

export type { DataComponentReferenceSchema, DataComponentScalarSchema, DataComponentSchemaEntry, DataComponentValueSchema }

export type DataComponentMapValue = Record<string, unknown>

export type SchemaValueEditorProps = {
  schema: DataComponentValueSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}
