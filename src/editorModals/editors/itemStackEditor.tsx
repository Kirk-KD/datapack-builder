import { useState } from 'react'
import type { EditorComponentProps } from '../types'

function getInitialValue(context: unknown) {
  if (
    context
    && typeof context === 'object'
    && 'value' in context
    && typeof context.value === 'string'
  ) {
    return context.value
  }

  return ''
}

function ItemStackEditor({ context, setPendingResult }: EditorComponentProps) {
  const [value, setValue] = useState(() => getInitialValue(context))

  function updateValue(nextValue: string) {
    setValue(nextValue)
    setPendingResult(nextValue)
  }

  return (
    <div className="editorModalPlaceholder">
      <p>Stub item stack editor.</p>
      <label htmlFor="item-stack-input">Item stack value</label>
      <input
        id="item-stack-input"
        type="text"
        value={value}
        onChange={(event) => updateValue(event.target.value)}
        className="editorModalInput"
        placeholder="minecraft:stone"
      />
    </div>
  )
}

export default ItemStackEditor
