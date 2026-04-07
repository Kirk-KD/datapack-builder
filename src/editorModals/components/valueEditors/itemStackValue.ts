import type { DataComponentMapValue } from '../dataComponents/types'

export type ItemStackEditorValue = {
  id: string
  count: number
  components: DataComponentMapValue
}

const EMPTY_ITEM_STACK_VALUE: ItemStackEditorValue = {
  id: '',
  count: 1,
  components: {},
}

function coerceCount(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 1
  }

  return Math.max(1, Math.trunc(value))
}

export function coerceItemStackEditorValue(value: unknown): ItemStackEditorValue {
  if (
    value
    && typeof value === 'object'
    && (('id' in value && typeof value.id === 'string') || ('value' in value && typeof value.value === 'string'))
  ) {
    const id =
      'id' in value && typeof value.id === 'string'
        ? value.id
        : 'value' in value && typeof value.value === 'string'
          ? value.value
          : ''

    return {
      id,
      count: 'count' in value ? coerceCount(value.count) : 1,
      components:
        'components' in value
        && value.components
        && typeof value.components === 'object'
        && !Array.isArray(value.components)
          ? { ...(value.components as Record<string, unknown>) }
          : {},
    }
  }

  return { ...EMPTY_ITEM_STACK_VALUE }
}

export function isItemStackEditorValue(value: unknown): boolean {
  return Boolean(
    value
    && typeof value === 'object'
    && 'id' in value
    && typeof value.id === 'string'
    && 'count' in value
    && typeof value.count === 'number'
    && 'components' in value
    && typeof value.components === 'object'
    && value.components !== null
    && !Array.isArray(value.components),
  )
}
