import { useEffect, useMemo, useState } from 'react'
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
  const [mode, setMode] = useState<'text' | 'json'>(() => {
    if (supportsTextMode(schema.ref) && typeof value === 'string') {
      return 'text'
    }
    return 'json'
  })
  const [text, setText] = useState(() => stringifyReferenceValue(value))

  useEffect(() => {
    setMode(supportsTextMode(schema.ref) && typeof value === 'string' ? 'text' : 'json')
    setText(stringifyReferenceValue(value))
  }, [schema.ref, value])

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
            setMode(nextMode)

            if (nextMode === 'text') {
              if (typeof value !== 'string') {
                setText('')
                onChange('')
              }
              return
            }

            setText('{}')
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
          setText(nextText)

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
