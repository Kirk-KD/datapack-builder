import type { SchemaValueEditorProps } from './types'
import type {
  DataComponentListSchema,
  DataComponentMapSchema,
  DataComponentObjectSchema,
  DataComponentUnionSchema,
  DataComponentValueSchema,
} from '../../../catalog/dataComponentSchemaCatalog'
import { createDefaultValue, inferUnionOptionIndex } from './utils'
import StringFieldEditor from './fields/StringFieldEditor'
import NumberFieldEditor from './fields/NumberFieldEditor'
import BooleanFieldEditor from './fields/BooleanFieldEditor'
import IntArrayFieldEditor from './fields/IntArrayFieldEditor'
import ReferenceFieldEditor from './fields/ReferenceFieldEditor'
import HelpTooltip from './HelpTooltip'
import './dataComponents.css'

function createMapEntryKey(mapValue: Record<string, unknown>) {
  const defaultKey = 'key'

  if (!(defaultKey in mapValue)) {
    return defaultKey
  }

  let index = 2
  while (`${defaultKey}_${index}` in mapValue) {
    index += 1
  }
  return `${defaultKey}_${index}`
}

function renameMapEntryKey(
  mapValue: Record<string, unknown>,
  currentKey: string,
  nextKey: string,
) {
  if (currentKey === nextKey) {
    return mapValue
  }

  const nextValue: Record<string, unknown> = {}
  for (const [entryKey, entryValue] of Object.entries(mapValue)) {
    nextValue[entryKey === currentKey ? nextKey : entryKey] = entryValue
  }
  return nextValue
}

function MapValueEditor({
  schema,
  label,
  value,
  onChange,
}: {
  schema: DataComponentMapSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}) {
  const mapValue = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const entrySchema = schema.value
  const keyPlaceholder = schema.key.semantic_type?.replaceAll('_', ' ') ?? 'key'

  return (
    <div className="dataComponentGroupBlock">
      {label && (
        <div className="dataComponentGroupHeader">
          <div className="dataComponentGroupLabel">{label}</div>
          {schema.description && <HelpTooltip text={schema.description} />}
        </div>
      )}
      <div className="dataComponentGroup">
        <div className="dataComponentMapList">
          {Object.entries(mapValue).map(([entryKey, entryValue]) => (
            <div key={entryKey} className="dataComponentMapEntry">
              <input
                className="editorModalInput dataComponentMapKeyInput"
                type="text"
                value={entryKey}
                placeholder={keyPlaceholder}
                onChange={(event) => onChange(renameMapEntryKey(mapValue, entryKey, event.target.value))}
              />
              <div className="dataComponentMapValue">
                <SchemaValueEditor
                  schema={entrySchema}
                  value={entryValue}
                  onChange={(nextEntryValue) => {
                    onChange({
                      ...mapValue,
                      [entryKey]: nextEntryValue,
                    })
                  }}
                />
              </div>
              <button
                type="button"
                className="editorModalButton dataComponentMapRemoveButton"
                onClick={() => {
                  const nextValue = { ...mapValue }
                  delete nextValue[entryKey]
                  onChange(nextValue)
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="editorModalButton"
            onClick={() => {
              const nextKey = createMapEntryKey(mapValue)
              onChange({
                ...mapValue,
                [nextKey]: createDefaultValue(entrySchema),
              })
            }}
          >
            Add entry
          </button>
        </div>
      </div>
    </div>
  )
}

function ObjectValueEditor({
  schema,
  label,
  value,
  onChange,
}: {
  schema: DataComponentObjectSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}) {
  const objectValue = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

  return (
    <div className="dataComponentGroupBlock">
      {label && (
        <div className="dataComponentGroupHeader">
          <div className="dataComponentGroupLabel">{label}</div>
          {schema.description && <HelpTooltip text={schema.description} />}
        </div>
      )}
      <div className="dataComponentGroup">
        {schema.fields.map((field: DataComponentObjectSchema['fields'][number]) => (
          <SchemaValueEditor
            key={field.key}
            label={field.key}
            schema={field.schema}
            value={objectValue[field.key]}
            onChange={(nextFieldValue) => {
              onChange({
                ...objectValue,
                [field.key]: nextFieldValue,
              })
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ListValueEditor({
  schema,
  label,
  value,
  onChange,
}: {
  schema: DataComponentListSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}) {
  const listValue = Array.isArray(value) ? value : []

  return (
    <div className="dataComponentGroupBlock">
      {label && (
        <div className="dataComponentGroupHeader">
          <div className="dataComponentGroupLabel">{label}</div>
          {schema.description && <HelpTooltip text={schema.description} />}
        </div>
      )}
      <div className="dataComponentGroup">
        <div className="dataComponentList">
          {listValue.map((entry, index) => (
            <div key={index} className="dataComponentListEntry">
              <SchemaValueEditor
                schema={schema.item}
                value={entry}
                onChange={(nextEntryValue) => {
                  const nextValue = [...listValue]
                  nextValue[index] = nextEntryValue
                  onChange(nextValue)
                }}
              />
              <button
                type="button"
                className="editorModalButton"
                onClick={() => {
                  onChange(listValue.filter((_, entryIndex) => entryIndex !== index))
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="editorModalButton"
            onClick={() => onChange([...listValue, createDefaultValue(schema.item)])}
          >
            Add entry
          </button>
        </div>
      </div>
    </div>
  )
}

function UnionValueEditor({
  schema,
  label,
  value,
  onChange,
}: {
  schema: DataComponentUnionSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}) {
  const selectedIndex = inferUnionOptionIndex(schema.options, value)
  const selectedSchema = schema.options[selectedIndex] ?? schema.options[0]
  if (!selectedSchema) {
    return null
  }

  return (
    <div className="dataComponentGroupBlock">
      {label && (
        <div className="dataComponentGroupHeader">
          <div className="dataComponentGroupLabel">{label}</div>
          {schema.description && <HelpTooltip text={schema.description} />}
        </div>
      )}
      <div className="dataComponentGroup">
        <select
        className="editorModalInput"
        value={selectedIndex}
        onChange={(event) => {
          const nextIndex = Number(event.target.value)
          const nextSchema = schema.options[nextIndex]
          if (nextSchema) {
            onChange(createDefaultValue(nextSchema))
          }
        }}>
          {schema.options.map((option: DataComponentValueSchema, index: number) => (
            <option key={index} value={index}>
              {getSchemaOptionLabel(option)}
            </option>
          ))}
        </select>
        <SchemaValueEditor schema={selectedSchema} value={value} onChange={onChange} />
      </div>
    </div>
  )
}

function OpaqueValueEditor({ label, value, onChange }: SchemaValueEditorProps) {
  return (
    <StringFieldEditor
      schema={{ kind: 'scalar', type: 'string' }}
      label={label}
      value={typeof value === 'string' ? value : JSON.stringify(value ?? '')}
      onChange={onChange}
    />
  )
}

function getSchemaOptionLabel(schema: DataComponentValueSchema) {
  switch (schema.kind) {
    case 'scalar':
      return schema.semantic_type ?? schema.type
    case 'object':
      return 'object'
    case 'map':
      return 'map'
    case 'list':
      return 'list'
    case 'reference':
      return schema.ref
    case 'union':
      return 'union'
    case 'opaque':
      return 'opaque'
  }
}

function SchemaValueEditor({ schema, label, value, onChange }: SchemaValueEditorProps) {
  switch (schema.kind) {
    case 'scalar':
      if (schema.type === 'boolean') {
        return <BooleanFieldEditor schema={schema} label={label} value={value} onChange={onChange} />
      }
      if (schema.type === 'int_array' || schema.type === 'byte_array') {
        return <IntArrayFieldEditor schema={schema} label={label} value={value} onChange={onChange} />
      }
      if (schema.type === 'byte' || schema.type === 'int' || schema.type === 'long' || schema.type === 'float' || schema.type === 'double') {
        return <NumberFieldEditor schema={schema} label={label} value={value} onChange={onChange} />
      }
      return <StringFieldEditor schema={schema} label={label} value={value} onChange={onChange} />
    case 'object':
      return <ObjectValueEditor schema={schema} label={label} value={value} onChange={onChange} />
    case 'map':
      return <MapValueEditor schema={schema} label={label} value={value} onChange={onChange} />
    case 'list':
      return <ListValueEditor schema={schema} label={label} value={value} onChange={onChange} />
    case 'union':
      return <UnionValueEditor schema={schema} label={label} value={value} onChange={onChange} />
    case 'reference':
      return <ReferenceFieldEditor schema={schema} label={label} value={value} onChange={onChange} />
    case 'opaque':
      return <OpaqueValueEditor schema={schema} label={label} value={value} onChange={onChange} />
  }
}

export default SchemaValueEditor
