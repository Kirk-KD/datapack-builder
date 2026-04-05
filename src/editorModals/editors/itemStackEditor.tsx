import { useState } from 'react'
import ItemSelector from '../components/ItemSelector'
import type { EditorComponentProps } from '../types'

type ItemStackEditorValue = {
  value: string
  spriteFileName: string
}

function getInitialValue(context: unknown): ItemStackEditorValue {
  if (
    context
    && typeof context === 'object'
    && 'value' in context
    && typeof context.value === 'string'
  ) {
    return {
      value: context.value,
      spriteFileName:
        'spriteFileName' in context && typeof context.spriteFileName === 'string'
          ? context.spriteFileName
          : '',
    }
  }

  return {
    value: '',
    spriteFileName: '',
  }
}

function ItemStackEditor({ context, setPendingResult }: EditorComponentProps) {
  const [resolvedValue, setResolvedValue] = useState<ItemStackEditorValue>(() => getInitialValue(context))

  function updateValue(nextValue: ItemStackEditorValue) {
    setResolvedValue(nextValue)
    setPendingResult(nextValue)
  }

  return (
    <div className="editorModalSection editorModalSectionFill">
      <p className="editorModalTextMuted">Select a Minecraft item or type a custom item name.</p>
      <ItemSelector
        value={resolvedValue.value}
        onChange={(nextValue) => updateValue({ value: nextValue, spriteFileName: '' })}
        onResolvedChange={updateValue}
        columns={1}
        layout="fill"
      />
    </div>
  )
}

export default ItemStackEditor
