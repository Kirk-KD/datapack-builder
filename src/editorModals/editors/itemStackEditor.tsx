import { useEffect, useState } from 'react'
import type { EditorComponentProps } from '../types'
import ItemStackValueEditor from '../components/valueEditors/ItemStackValueEditor'
import {
  coerceItemStackEditorValue,
  type ItemStackEditorValue,
} from '../components/valueEditors/itemStackValue'

function ItemStackEditor({ context, setPendingResult }: EditorComponentProps) {
  const [resolvedValue, setResolvedValue] = useState<ItemStackEditorValue>(() => coerceItemStackEditorValue(context))

  useEffect(() => {
    setPendingResult(resolvedValue)
  }, [resolvedValue, setPendingResult])

  function updateValue(nextValue: ItemStackEditorValue) {
    setResolvedValue(nextValue)
    setPendingResult(nextValue)
  }

  return (
    <ItemStackValueEditor
      value={resolvedValue}
      onChange={updateValue}
      layout="auto"
      showItemHint
    />
  )
}

export default ItemStackEditor
