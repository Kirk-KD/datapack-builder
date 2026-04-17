import Blockly from "blockly"

// Data flow

export type EditorContext<T extends Record<string, unknown> = Record<string, never>> = {
  source?: Blockly.Block
} & T

export type EditorResult<T> = {
  error: boolean
  data?: T
  compileValue?: (options?: Record<string, unknown>) => string
}

export type EditorResultCallback<T> = (result: EditorResult<T>) => void

// JSON Schema

type BaseSchema = {
  optional?: boolean
  description?: string
  note?: string
}

export type EditorKind = 'scalar' | 'object' | 'reference' | 'list'

export type ScalarSchema = BaseSchema & {
  kind: 'scalar'
  type: 'string' | 'int' | 'float' | 'double' | 'select' | 'boolean'

  defaultValue?: string | number | boolean

  // if numeric
  min?: number
  max?: number

  // if select
  options?: string[]
}

export type ObjectSchema = BaseSchema & {
  kind: 'object'
  fields: {
    key: string
    schema: EditorSchema
  }[]
}

export type EditorReference = 'item_stack' // TODO more editors

export type ReferenceSchema = BaseSchema & {
  kind: 'reference'
  ref: EditorReference
}

export type ListSchema = BaseSchema & {
  kind: 'list'
  item: EditorSchema
}

export type EditorSchema = ScalarSchema | ObjectSchema | ReferenceSchema | ListSchema

export type OldState<T> = {
  value: T
  enabled: boolean
}

// Props

export type EditorBaseProps<AdditionalContext extends Record<string, unknown>, Result> = {
  context: EditorContext<AdditionalContext>
  callback: EditorResultCallback<Result>

  optional?: boolean
  description?: string
  note?: string
  
  initialValue?: Result
  oldState?: OldState<Result>
}

export type StringEditorProps = EditorBaseProps<Record<string, never>, string | null> & {
  defaultValue?: string
}

export type NumberEditorProps = EditorBaseProps<Record<string, never>, number | null> & {
  type: 'int' | 'float' | 'double'
  defaultValue?: number
  min?: number
  max?: number
}

export type BooleanEditorProps = EditorBaseProps<Record<string, never>, boolean | null> & {
  defaultValue?: boolean
}

export type SelectEditorProps = EditorBaseProps<Record<string, never>, string | null> & {
  defaultValue?: string
  options: string[]
}