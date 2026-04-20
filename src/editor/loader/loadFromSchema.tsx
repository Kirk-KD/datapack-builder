import type {
  EditorContext,
  EditorStateCallback,
  EditorSchema, ListSchema,
  ObjectSchema, ReferenceSchema,
  ScalarSchema, EditorState
} from "../types.ts";
import NumberEditor from "../editors/NumberEditor.tsx";
import * as React from "react";
import {KeyValueEditor} from "../editors/KeyValueEditor";
import type {KeyValueEditorEntry} from "../editors/KeyValueEditor/KeyValueEditor.tsx";
import {ItemStackEditor} from "../editors/ItemStackEditor";
import StringEditor from "../editors/StringEditor.tsx";
import BooleanEditor from "../editors/BooleanEditor.tsx";
import SelectEditor from "../editors/SelectEditor.tsx";
import ListEditor from "../editors/ListEditor/ListEditor.tsx";
import type {ItemStackEditorResult} from "../editors/ItemStackEditor/types.ts";

type BaseProps = {
  context: EditorContext<Record<string, unknown>>
  state: EditorState<unknown>
  setState: EditorStateCallback<unknown>
}

export default function loadFromSchema(schema: EditorSchema, props: BaseProps): React.ReactElement {
  switch (schema.kind) {
    case 'scalar': return makeScalar(schema as ScalarSchema, props)
    case 'object': return makeObject(schema as ObjectSchema, props)
    case 'reference': return makeReference(schema as ReferenceSchema, props)
    case 'list': return makeList(schema as ListSchema, props)
  }
}

function makeScalar(schema: ScalarSchema, {context, state, setState}: BaseProps): React.ReactElement {
  switch (schema.type) {
    case 'int':
    case 'long':
    case 'float':
    case 'double':
      return <NumberEditor context={context as EditorContext} state={state as EditorState<number>} setState={setState as EditorStateCallback<number>} type={schema.type as ('int' | 'long' | 'float' | 'double')} defaultValue={schema.defaultValue as number} min={schema.min} max={schema.max}/>
    case 'string':
      return <StringEditor context={context as EditorContext} state={state as EditorState<string>} setState={setState as EditorStateCallback<string>} defaultValue={schema.defaultValue as string}/>
    case 'boolean':
      return <BooleanEditor context={context as EditorContext} state={state as EditorState<boolean>} setState={setState as EditorStateCallback<boolean>} defaultValue={schema.defaultValue as boolean}/>
    case 'select':
      return <SelectEditor context={context as EditorContext} state={state as EditorState<string>} setState={setState as EditorStateCallback<string>} options={schema.options as string[]} defaultValue={schema.defaultValue as string}/>
  }
}

function makeObject(schema: ObjectSchema, {context, state, setState}: BaseProps): React.ReactElement {
  return <KeyValueEditor state={state as EditorState<Record<string, EditorState<unknown>>>} setState={setState as EditorStateCallback<Record<string, EditorState<unknown>>>} entries={schema.fields.map(({key, schema: fieldSchema}) => {
    const { kind, optional, description, note } = fieldSchema
    return {
      key,
      optional,
      description,
      note,
      nested: kind !== 'scalar',
      component: (fieldState, setFieldState) => loadFromSchema(fieldSchema, {context, state: fieldState, setState: setFieldState})
    } as KeyValueEditorEntry
  })}/>
}

function makeReference(schema: ReferenceSchema, {context, state, setState}: BaseProps): React.ReactElement {
  switch (schema.ref) {
    case 'item_stack': return (
      <ItemStackEditor context={context} state={state as EditorState<ItemStackEditorResult>} setState={setState as EditorStateCallback<ItemStackEditorResult>}/>
    )
  }
}

function makeList(schema: ListSchema, {context, state, setState}: BaseProps): React.ReactElement {
  return <ListEditor context={context} state={state as EditorState<unknown[]>} setState={setState as EditorStateCallback<unknown[]>} itemEditor={(itemState, setItemState) => loadFromSchema(schema.item, {context, state: itemState, setState: setItemState})}/>
}