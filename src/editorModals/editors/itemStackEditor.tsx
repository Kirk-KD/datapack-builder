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

function ItemStackEditor({ context, commit, close }: EditorComponentProps) {
  const [value, setValue] = useState(() => getInitialValue(context))

  return (
    <div className="editorModalPlaceholder">
      <p>Stub item stack editor.</p>
      <label htmlFor="item-stack-input">Item stack value</label>
      <input
        id="item-stack-input"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="editorModalInput"
        placeholder="minecraft:stone"
      />
      <div className="editorModalFooter">
        <div className="editorModalButtonRow">
          <button type="button" className="editorModalButton" onClick={close}>Cancel</button>
          <button type="button" className="editorModalButton" onClick={() => commit(value)}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default ItemStackEditor
