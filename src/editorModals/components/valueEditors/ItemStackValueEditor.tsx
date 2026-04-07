import ItemSelector from '../ItemSelector'
import DataComponentEditor from '../dataComponents/DataComponentEditor'
import HelpTooltip from '../dataComponents/HelpTooltip'
import {
  coerceItemStackEditorValue,
  type ItemStackEditorValue,
} from './itemStackValue'

type ItemStackValueEditorProps = {
  label?: string
  description?: string
  value: unknown
  onChange: (value: ItemStackEditorValue) => void
  layout?: 'auto' | 'fill'
  showItemHint?: boolean
}

function ItemStackValueEditor({
  label,
  description,
  value,
  onChange,
  layout = 'auto',
  showItemHint = false,
}: ItemStackValueEditorProps) {
  const resolvedValue = coerceItemStackEditorValue(value)

  function updateValue(nextValue: ItemStackEditorValue) {
    onChange(nextValue)
  }

  return (
    <div className="dataComponentGroupBlock">
      {label && (
        <div className="dataComponentGroupHeader">
          <div className="dataComponentGroupLabel">{label}</div>
          {description && <HelpTooltip text={description} />}
        </div>
      )}
      <div className="editorModalSection editorModalSectionFill">
        <div className="editorModalSection">
          {showItemHint && (
            <p className="editorModalTextMuted">Select a Minecraft item or type a custom item name.</p>
          )}
          <ItemSelector
            value={resolvedValue.id}
            onChange={(nextValue) => updateValue({ ...resolvedValue, id: nextValue })}
            layout={layout}
          />
        </div>
        <div className="editorModalSection">
          <DataComponentEditor
            value={resolvedValue.components}
            onChange={(components) => updateValue({ ...resolvedValue, components })}
          />
        </div>
      </div>
    </div>
  )
}

export default ItemStackValueEditor


