import { useMemo } from 'react'
import type { DataComponentReferenceSchema } from '../types'
import { parseJsonText } from '../utils'
import HelpTooltip from '../HelpTooltip'

type ReferenceFieldEditorProps = {
  schema: DataComponentReferenceSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}

function stringifyReferenceValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (value === null || value === undefined) {
    return ''
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ''
  }
}

function supportsTextMode(ref: string) {
  return ref === 'text_component' || ref === 'sound_event'
}

function ReferenceFieldEditor({ schema, label, value, onChange }: ReferenceFieldEditorProps) {
  const mode = supportsTextMode(schema.ref) && typeof value === 'string' ? 'text' : 'json'
  const text = stringifyReferenceValue(value)
  const parsedJson = useMemo(() => parseJsonText(text), [text])
  const error = mode === 'json' ? parsedJson.error : null

  return (
    <label className="dataComponentField">
      {label && (
        <span className="dataComponentFieldHeader">
          <span className="dataComponentFieldLabel">{label}</span>
          {schema.description && <HelpTooltip text={schema.description} />}
        </span>
      )}
      {supportsTextMode(schema.ref) && (
        <select
          className="editorModalInput"
          value={mode}
          onChange={(event) => {
            const nextMode = event.target.value === 'text' ? 'text' : 'json'
            if (nextMode === 'text') {
              onChange('')
              return
            }

            onChange({})
          }}
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
        </select>
      )}
      <textarea
        className="editorModalInput dataComponentTextarea"
        value={text}
        onChange={(event) => {
          const nextText = event.target.value

          if (mode === 'text') {
            onChange(nextText)
            return
          }

          const parsedValue = parseJsonText(nextText)
          if (!parsedValue.error) {
            onChange(parsedValue.value)
          }
        }}
      />
      {error && <span className="dataComponentFieldError">{error}</span>}
    </label>
  )
}

export default ReferenceFieldEditor
