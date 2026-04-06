import ComponentListEditor from './ComponentListEditor'
import { useDataComponentSchemas } from './schema'
import type { DataComponentMapValue } from './types'

type DataComponentEditorProps = {
  value: DataComponentMapValue
  onChange: (value: DataComponentMapValue) => void
}

function DataComponentEditor({ value, onChange }: DataComponentEditorProps) {
  const { schemas, error } = useDataComponentSchemas()

  if (error) {
    return <div className="editorModalStatusPanel">{error}</div>
  }

  if (!schemas) {
    return <div className="editorModalStatusPanel">Loading component schema...</div>
  }

  return <ComponentListEditor schemas={schemas} value={value} onChange={onChange} />
}

export default DataComponentEditor
