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
  const text = typeof value === 'string' ? value : ''
  const stringChoices = Array.isArray(schema.choices)
    ? schema.choices.filter((choice): choice is string => typeof choice === 'string')
    : []
  const usesDropdown = stringChoices.length > 0 && stringChoices.length === schema.choices?.length

  const validationError = validateScalarValue(schema, text)

  return (
    <label className="dataComponentField">
      {label && (
        <span className="dataComponentFieldHeader">
          <span className="dataComponentFieldLabel">{label}</span>
          {schema.description && <HelpTooltip text={schema.description} />}
        </span>
      )}
      {usesDropdown ? (
        <select
          className="editorModalInput"
          value={stringChoices.includes(text) ? text : ''}
          onChange={(event) => onChange(event.target.value)}
        >
          {!stringChoices.includes(text) && (
            <option value="" disabled>
              Select a value
            </option>
          )}
          {stringChoices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="editorModalInput"
          type="text"
          value={text}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {validationError && <span className="dataComponentFieldError">{validationError}</span>}
    </label>
  )
}

export default StringFieldEditor
