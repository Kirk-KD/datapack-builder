import Blockly from "blockly"
import type {Dispatch, SetStateAction} from "react";

// Data flow

export type EditorContext<T extends Record<string, unknown> = Record<string, never>> = {
  source?: Blockly.Block
} & T

export type EditorState<T> = {
  error: boolean
  data?: T
  enabled?: boolean
}

export type EditorStateCallback<T> = Dispatch<SetStateAction<EditorState<T>>>

// JSON Schema

type BaseSchema = {
  optional?: boolean
  description?: string
  note?: string
}

export type EditorKind = 'scalar' | 'object' | 'reference' | 'list'

export type ScalarSchema = BaseSchema & {
  kind: 'scalar'
  type: 'string' | 'int' | 'long' | 'float' | 'double' | 'select' | 'boolean'

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
  state: EditorState<Result>
  setState: EditorStateCallback<Result>

  optional?: boolean
  description?: string
  note?: string
  
  initialValue?: Result
  oldState?: OldState<Result>
}

export type StringEditorProps = EditorBaseProps<Record<string, never>, string> & {
  defaultValue?: string
}

export type NumberEditorProps = EditorBaseProps<Record<string, never>, number> & {
  type: 'int' | 'long' | 'float' | 'double'
  defaultValue?: number
  min?: number
  max?: number
}

export type BooleanEditorProps = EditorBaseProps<Record<string, never>, boolean> & {
  defaultValue?: boolean
}

export type SelectEditorProps = EditorBaseProps<Record<string, never>, string> & {
  defaultValue?: string
  options: string[]
}