import { useEffect, useState } from 'react'
import type { DataComponentScalarSchema } from '../types'
import { parseNumberArrayInput, validateScalarValue } from '../utils'
import HelpTooltip from '../HelpTooltip'

type IntArrayFieldEditorProps = {
  schema: DataComponentScalarSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}

function IntArrayFieldEditor({ schema, label, value, onChange }: IntArrayFieldEditorProps) {
  const [text, setText] = useState(Array.isArray(value) ? value.join(', ') : '')

  useEffect(() => {
    setText(Array.isArray(value) ? value.join(', ') : '')
  }, [value])

  const parsedValue = parseNumberArrayInput(text)
  const validationError = parsedValue === null ? 'Expected a comma-separated list of numbers.' : validateScalarValue(schema, parsedValue)

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
        value={text}
        onChange={(event) => {
          const nextValue = event.target.value
          setText(nextValue)

          const parsedNextValue = parseNumberArrayInput(nextValue)
          if (parsedNextValue !== null) {
            onChange(parsedNextValue)
          }
        }}
      />
      {validationError && <span className="dataComponentFieldError">{validationError}</span>}
    </label>
  )
}

export default IntArrayFieldEditor
