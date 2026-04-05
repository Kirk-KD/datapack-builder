import { useState } from 'react'
import ItemSelector from '../components/ItemSelector'
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
    <div className="editorModalSection editorModalSectionFill">
      <p className="editorModalTextMuted">Select a Minecraft item or type a custom item name.</p>
      <ItemSelector value={value} onChange={updateValue} columns={1} layout="fill" />
    </div>
  )
}

export default ItemStackEditor
