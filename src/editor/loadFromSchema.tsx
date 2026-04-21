import type {
  AnyEditorState,
  AnyEditorStateCallback,
  EditorContext,
  EditorStateList,
  EditorStateMap,
  EditorStateCallback,
  EditorSchema, ListSchema,
  ObjectSchema, ReferenceSchema,
  ScalarSchema, EditorState
} from "./types.ts";
import NumberEditor from "./editors/NumberEditor.tsx";
import * as React from "react";
import {ObjectEditor} from "./editors/ObjectEditor";
import type {ObjectEditorEntry} from "./editors/ObjectEditor/ObjectEditor.tsx";
import {ItemStackEditor, type ItemStackEditorResult} from "./editors/ItemStackEditor";
import StringEditor from "./editors/StringEditor.tsx";
import BooleanEditor from "./editors/BooleanEditor.tsx";
import SelectEditor from "./editors/SelectEditor.tsx";
import ListEditor from "./editors/ListEditor/ListEditor.tsx";
import {ItemSelectorEditor} from "./editors/ItemSelectorEditor";
import {inferCompilerType} from "../compiler/compileEditorState.ts";

type BaseProps = {
  context: EditorContext<Record<string, unknown>>
  state: AnyEditorState
  setState: AnyEditorStateCallback
}

export default function loadFromSchema(schema: EditorSchema, props: BaseProps): React.ReactElement {
  switch (schema.kind) {
    case 'scalar': return makeScalar(schema as ScalarSchema, props)
    case 'object': return makeObject(schema as ObjectSchema, props)
    case 'reference': return makeReference(schema as ReferenceSchema, props)
    case 'list': return makeList(schema as ListSchema, props)
  }
}

function makeScalar(schema: ScalarSchema, {state, setState}: BaseProps): React.ReactElement {
  switch (schema.type) {
    case 'int':
    case 'long':
    case 'float':
    case 'double':
      return (
        <NumberEditor
          state={state as EditorState<number>}
          setState={setState as EditorStateCallback<number>}
          type={schema.type as ('int' | 'long' | 'float' | 'double')}
          defaultValue={schema.defaultValue as number}
          min={schema.min}
          max={schema.max}
        />
      )
    case 'string':
      return (
        <StringEditor
          state={state as EditorState<string>}
          setState={setState as EditorStateCallback<string>}
          defaultValue={schema.defaultValue as string}
        />
      )
    case 'boolean':
      return (
        <BooleanEditor
          state={state as EditorState<boolean>}
          setState={setState as EditorStateCallback<boolean>}
          defaultValue={schema.defaultValue as boolean}
        />
      )
    case 'select':
      return (
        <SelectEditor
          state={state as EditorState<string>}
          setState={setState as EditorStateCallback<string>}
          options={schema.options as string[]}
          defaultValue={schema.defaultValue as string}
        />
      )
  }
}

function makeObject(schema: ObjectSchema, {context, state, setState}: BaseProps): React.ReactElement {
  return (
    <ObjectEditor
      state={state as EditorState<EditorStateMap>}
      setState={setState as EditorStateCallback<EditorStateMap>}
      entries={schema.fields.map(({key, schema: fieldSchema}) => {
        const { kind, optional, description, note } = fieldSchema
        return {
          compiler: inferCompilerType(fieldSchema),
          key,
          optional,
          description,
          note,
          nested: kind !== 'scalar',
          component: (fieldState, setFieldState) =>
            loadFromSchema(fieldSchema, {context, state: fieldState, setState: setFieldState})
        } as ObjectEditorEntry
      })}
    />
  )
}

function makeReference(schema: ReferenceSchema, {context, state, setState}: BaseProps): React.ReactElement {
  switch (schema.ref) {
    case 'item': return (
      <ItemSelectorEditor
        state={state as EditorState<string>}
        setState={setState as EditorStateCallback<string>}
      />
    )
    case 'item_stack': return (
      <ItemStackEditor
        context={context}
        state={state as EditorState<ItemStackEditorResult>}
        setState={setState as EditorStateCallback<ItemStackEditorResult>}
      />
    )
  }
}

function makeList(schema: ListSchema, {context, state, setState}: BaseProps): React.ReactElement {
  return (
    <ListEditor
      context={context}
      state={state as EditorState<EditorStateList>}
      setState={setState as EditorStateCallback<EditorStateList>}
      itemEditor={(itemState, setItemState) =>
        loadFromSchema(schema.item, {context, state: itemState, setState: setItemState})}/>
  )
}