import { useMemo, useState } from 'react'
import type { DataComponentMapValue, DataComponentSchemaEntry } from './types'
import { createDefaultValue } from './utils'
import SchemaValueEditor from './SchemaValueEditor'

type ComponentListEditorProps = {
  schemas: readonly DataComponentSchemaEntry[]
  value: DataComponentMapValue
  onChange: (value: DataComponentMapValue) => void
}

function ComponentListEditor({ schemas, value, onChange }: ComponentListEditorProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string>('')
  const [activeComponentId, setActiveComponentId] = useState<string | null>(Object.keys(value)[0] ?? null)

  const schemaById = useMemo(
    () => new Map(schemas.map((schema) => [schema.id, schema])),
    [schemas],
  )

  const availableSchemas = schemas.filter((schema) => !(schema.id in value))
  const activeSchema = activeComponentId ? schemaById.get(activeComponentId) ?? null : null

  function getDisplayName(componentId: string) {
    return schemaById.get(componentId)?.label ?? componentId
  }

  return (
    <div className="dataComponentEditorRoot">
      <div className="dataComponentSidebar">
        <div className="dataComponentSidebarHeader">Components</div>
        <div className="dataComponentAddRow">
          <select
            className="editorModalInput"
            value={selectedComponentId}
            onChange={(event) => setSelectedComponentId(event.target.value)}
          >
            <option value="">Select component...</option>
            {availableSchemas.map((schema) => (
              <option key={schema.id} value={schema.id}>{schema.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="editorModalButton"
            onClick={() => {
              if (!selectedComponentId) return
              const schema = schemaById.get(selectedComponentId)
              if (!schema) return

              const nextValue = {
                ...value,
                [selectedComponentId]: createDefaultValue(schema.value_schema),
              }
              onChange(nextValue)
              setActiveComponentId(selectedComponentId)
              setSelectedComponentId('')
            }}
          >
            Add
          </button>
        </div>
        <div className="dataComponentSidebarList">
          {Object.keys(value).length === 0 ? (
            <div className="editorModalStatusPanel">No components added.</div>
          ) : (
            Object.keys(value).sort().map((componentId) => (
              <div key={componentId} className={`dataComponentSidebarEntry${componentId === activeComponentId ? ' is-active' : ''}`}>
                <button
                  type="button"
                  className="dataComponentSidebarEntryButton"
                  onClick={() => setActiveComponentId(componentId)}
                >
                  {getDisplayName(componentId)}
                </button>
                <button
                  type="button"
                  className="editorModalIconButton"
                  onClick={() => {
                    const nextValue = { ...value }
                    delete nextValue[componentId]
                    onChange(nextValue)
                    if (activeComponentId === componentId) {
                      setActiveComponentId(Object.keys(nextValue)[0] ?? null)
                    }
                  }}
                  aria-label={`Remove ${getDisplayName(componentId)}`}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="dataComponentMain">
        {!activeSchema || !activeComponentId ? (
          <div className="editorModalStatusPanel">Select a component to edit it.</div>
        ) : (
          <SchemaValueEditor
            label={activeSchema.label}
            schema={activeSchema.value_schema}
            value={value[activeComponentId]}
            onChange={(nextComponentValue) => {
              onChange({
                ...value,
                [activeComponentId]: nextComponentValue,
              })
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ComponentListEditor
