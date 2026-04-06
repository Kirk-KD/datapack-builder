import { useState } from 'react'
import ItemSelector from '../components/ItemSelector'
import DataComponentEditor from '../components/dataComponents/DataComponentEditor'
import type { EditorComponentProps } from '../types'
import type { DataComponentMapValue } from '../components/dataComponents/types'

type ItemStackEditorValue = {
  value: string
  spriteFileName: string
  components: DataComponentMapValue
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
      components:
        'components' in context
        && context.components
        && typeof context.components === 'object'
        && !Array.isArray(context.components)
          ? { ...(context.components as Record<string, unknown>) }
          : {},
    }
  }

  return {
    value: '',
    spriteFileName: '',
    components: {},
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
      <div className="editorModalSection">
        <p className="editorModalTextMuted">Select a Minecraft item or type a custom item name.</p>
        <ItemSelector
          value={resolvedValue.value}
          onChange={(nextValue) => updateValue({ ...resolvedValue, value: nextValue, spriteFileName: '' })}
          onResolvedChange={(nextValue) => updateValue({ ...resolvedValue, ...nextValue })}
          layout="auto"
        />
      </div>
      <div className="editorModalSection">
        <DataComponentEditor
          value={resolvedValue.components}
          onChange={(components) => updateValue({ ...resolvedValue, components })}
        />
      </div>
    </div>
  )
}

export default ItemStackEditor
