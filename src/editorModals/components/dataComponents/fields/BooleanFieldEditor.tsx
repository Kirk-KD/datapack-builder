import type { DataComponentScalarSchema } from '../types'
import HelpTooltip from '../HelpTooltip'

type BooleanFieldEditorProps = {
  schema: DataComponentScalarSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}

function BooleanFieldEditor({ schema, label, value, onChange }: BooleanFieldEditorProps) {
  const checked = typeof value === 'boolean' ? value : false

  return (
    <label className="dataComponentField">
      {label && (
        <span className="dataComponentFieldHeader">
          <span className="dataComponentFieldLabel">{label}</span>
          {schema.description && <HelpTooltip text={schema.description} />}
        </span>
      )}
      <label className="dataComponentCheckboxRow">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{checked ? 'true' : 'false'}</span>
      </label>
    </label>
  )
}

export default BooleanFieldEditor
