import type {
  DataComponentReferenceSchema,
  DataComponentScalarSchema,
  DataComponentValueSchema,
} from './types'

function isNumericScalar(type: DataComponentScalarSchema['type']) {
  return type === 'byte'
    || type === 'int'
    || type === 'long'
    || type === 'float'
    || type === 'double'
}

export function createDefaultValue(schema: DataComponentValueSchema): unknown {
  if ('default' in schema && schema.default !== undefined) {
    return schema.default
  }

  switch (schema.kind) {
    case 'scalar':
      if (schema.type === 'boolean') return false
      if (schema.type === 'int_array' || schema.type === 'byte_array') return []
      if (isNumericScalar(schema.type)) return schema.min ?? 0
      if (schema.type === 'string') {
        const firstChoice = schema.choices?.find((choice): choice is string => typeof choice === 'string')
        return firstChoice ?? ''
      }
      return ''
    case 'object': {
      const value: Record<string, unknown> = {}
      for (const field of schema.fields) {
        value[field.key] = createDefaultValue(field.schema)
      }
      return value
    }
    case 'map':
      return {}
    case 'list':
      return []
    case 'union':
      return schema.options[0] ? createDefaultValue(schema.options[0]) : null
    case 'reference':
      return createDefaultReferenceValue(schema)
    case 'opaque':
      return ''
  }
}

function createDefaultReferenceValue(schema: DataComponentReferenceSchema) {
  if (schema.ref === 'text_component' || schema.ref === 'sound_event') {
    return ''
  }

  return {}
}

export function validateScalarValue(schema: DataComponentScalarSchema, value: unknown): string | null {
  if (schema.type === 'string') {
    if (typeof value !== 'string') return 'Expected text.'
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') return 'Expected true or false.'
  } else if (schema.type === 'int_array' || schema.type === 'byte_array') {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'number' || Number.isNaN(entry))) {
      return 'Expected a list of numbers.'
    }
  } else if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Expected a number.'
  }

  if (schema.choices && schema.choices.length > 0 && !schema.choices.includes(value)) {
    return 'Value must be one of the allowed choices.'
  }

  if (typeof value === 'number') {
    if (schema.min !== undefined && value < schema.min) {
      return `Value must be at least ${schema.min}.`
    }
    if (schema.max !== undefined && value > schema.max) {
      return `Value must be at most ${schema.max}.`
    }
  }

  return null
}

export function inferUnionOptionIndex(options: DataComponentValueSchema[], value: unknown) {
  const index = options.findIndex((option: DataComponentValueSchema) => matchesSchema(option, value))
  return index >= 0 ? index : 0
}

function matchesSchema(schema: DataComponentValueSchema, value: unknown): boolean {
  switch (schema.kind) {
    case 'scalar':
      if (schema.type === 'string') return typeof value === 'string'
      if (schema.type === 'boolean') return typeof value === 'boolean'
      if (schema.type === 'int_array' || schema.type === 'byte_array') return Array.isArray(value)
      return typeof value === 'number'
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value)
    case 'map':
      return typeof value === 'object' && value !== null && !Array.isArray(value)
    case 'list':
      return Array.isArray(value)
    case 'reference':
      if (schema.ref === 'text_component' || schema.ref === 'sound_event') {
        return typeof value === 'string' || (typeof value === 'object' && value !== null)
      }
      return typeof value === 'object' && value !== null
    case 'union':
      return schema.options.some((option) => matchesSchema(option, value))
    case 'opaque':
      return true
  }

  return false
}

export function parseNumericInput(rawValue: string, schema: DataComponentScalarSchema) {
  const trimmed = rawValue.trim()
  if (trimmed === '') {
    return createDefaultValue(schema)
  }

  const nextValue = Number(trimmed)
  if (Number.isNaN(nextValue)) {
    return null
  }

  if (schema.type === 'byte' || schema.type === 'int' || schema.type === 'long') {
    return Math.trunc(nextValue)
  }

  return nextValue
}

export function parseNumberArrayInput(rawValue: string) {
  const trimmed = rawValue.trim()
  if (trimmed === '') {
    return []
  }

  const values = trimmed
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => Number(entry))

  if (values.some((entry) => Number.isNaN(entry))) {
    return null
  }

  return values
}

export function parseJsonText(rawValue: string) {
  const trimmed = rawValue.trim()
  if (trimmed === '') {
    return {}
  }

  try {
    return {
      value: JSON.parse(trimmed) as unknown,
      error: null,
    }
  } catch (error) {
    return {
      value: null,
      error: error instanceof Error ? error.message : 'Invalid JSON.',
    }
  }
}
