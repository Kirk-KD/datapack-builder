import type { ReactElement } from 'react'
import type { DataComponentReferenceSchema } from './types'
import ItemStackValueEditor from '../valueEditors/ItemStackValueEditor'
import {
  coerceItemStackEditorValue,
  isItemStackEditorValue,
} from '../valueEditors/itemStackValue'

type InlineReferenceEditorProps = {
  schema: DataComponentReferenceSchema
  label?: string
  value: unknown
  onChange: (value: unknown) => void
}

type ReferenceEditorDefinition = {
  supportsTextMode?: boolean
  createDefaultValue: () => unknown
  matchesValue: (value: unknown) => boolean
  renderInline?: (props: InlineReferenceEditorProps) => ReactElement
}

const referenceEditorDefinitions: Record<string, ReferenceEditorDefinition> = {
  item_stack: {
    createDefaultValue: () => coerceItemStackEditorValue(null),
    matchesValue: (value) => isItemStackEditorValue(value),
    renderInline: ({ schema, label, value, onChange }) => (
      <ItemStackValueEditor
        label={label}
        description={schema.description}
        value={value}
        onChange={onChange}
      />
    ),
  },
  text_component: {
    supportsTextMode: true,
    createDefaultValue: () => '',
    matchesValue: (value) => typeof value === 'string' || (typeof value === 'object' && value !== null),
  },
  sound_event: {
    supportsTextMode: true,
    createDefaultValue: () => '',
    matchesValue: (value) => typeof value === 'string' || (typeof value === 'object' && value !== null),
  },
}

function getReferenceEditorDefinition(ref: string) {
  return referenceEditorDefinitions[ref]
}

export function createDefaultReferenceValue(schema: DataComponentReferenceSchema) {
  return getReferenceEditorDefinition(schema.ref)?.createDefaultValue() ?? {}
}

export function matchesReferenceValue(schema: DataComponentReferenceSchema, value: unknown) {
  return getReferenceEditorDefinition(schema.ref)?.matchesValue(value)
    ?? (typeof value === 'object' && value !== null)
}

export function supportsTextMode(ref: string) {
  return getReferenceEditorDefinition(ref)?.supportsTextMode ?? false
}

export function renderReferenceInlineEditor(props: InlineReferenceEditorProps) {
  return getReferenceEditorDefinition(props.schema.ref)?.renderInline?.(props) ?? null
}


