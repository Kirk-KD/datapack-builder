import { useEffect, useState } from 'react'
import type { DataComponentScalarSchema } from '../types'
import { parseNumericInput, validateScalarValue } from '../utils'
import HelpTooltip from '../HelpTooltip'

type NumberFieldEditorProps = {
  schema: DataComponentScalarSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}

function NumberFieldEditor({ schema, label, value, onChange }: NumberFieldEditorProps) {
  const [text, setText] = useState(typeof value === 'number' ? String(value) : '')

  useEffect(() => {
    setText(typeof value === 'number' ? String(value) : '')
  }, [value])

  const parsedValue = parseNumericInput(text, schema)
  const validationError = parsedValue === null ? 'Expected a valid number.' : validateScalarValue(schema, parsedValue)

  return (
    <label className="dataComponentField">
      {label && (
        <span className="dataComponentFieldHeader">
          <span className="dataComponentFieldLabel">{label}</span>
          {schema.description && <HelpTooltip text={schema.description} />}
        </span>
      )}
      <input
        className="editorModalInput"
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(event) => {
          const nextValue = event.target.value
          setText(nextValue)

          const parsedNextValue = parseNumericInput(nextValue, schema)
          if (parsedNextValue !== null) {
            onChange(parsedNextValue)
          }
        }}
      />
      {validationError && <span className="dataComponentFieldError">{validationError}</span>}
    </label>
  )
}

export default NumberFieldEditor
