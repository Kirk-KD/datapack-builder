import { useEffect, useState } from 'react'
import type { DataComponentScalarSchema } from '../types'
import { validateScalarValue } from '../utils'
import HelpTooltip from '../HelpTooltip'

type StringFieldEditorProps = {
  schema: DataComponentScalarSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}

function StringFieldEditor({ schema, label, value, onChange }: StringFieldEditorProps) {
  const [text, setText] = useState(typeof value === 'string' ? value : '')

  useEffect(() => {
    setText(typeof value === 'string' ? value : '')
  }, [value])

  const validationError = validateScalarValue(schema, text)

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
          onChange(nextValue)
        }}
      />
      {validationError && <span className="dataComponentFieldError">{validationError}</span>}
    </label>
  )
}

export default StringFieldEditor
