import type {
  EditorContext,
  EditorResultCallback,
  EditorSchema,
  ObjectSchema, ReferenceSchema,
  ScalarSchema
} from "../types.ts";
import NumberEditor from "../editors/NumberEditor.tsx";
import * as React from "react";
import {KeyValueEditor} from "../editors/KeyValueEditor";
import type {KeyValueEditorEntry} from "../editors/KeyValueEditor/KeyValueEditor.tsx";
import {ItemStackEditor} from "../editors/ItemStackEditor";
import StringEditor from "../editors/StringEditor.tsx";
import BooleanEditor from "../editors/BooleanEditor.tsx";
import SelectEditor from "../editors/SelectEditor.tsx";

type BaseProps = {
  context: EditorContext<Record<string, unknown>>
  callback: EditorResultCallback<unknown>
}

// @ts-expect-error TODO list
export default function loadFromSchema(schema: EditorSchema, props: BaseProps): React.ReactElement {
  switch (schema.kind) {
    case 'scalar': return makeScalar(schema as ScalarSchema, props)
    case 'object': return makeObject(schema as ObjectSchema, props)
    case 'reference': return makeReference(schema as ReferenceSchema, props)
  }
}

function makeScalar(schema: ScalarSchema, {context, callback}: BaseProps): React.ReactElement {
  switch (schema.type) {
    case 'int':
    case 'long':
    case 'float':
    case 'double':
      return <NumberEditor context={context as EditorContext} callback={callback} type={'int'} defaultValue={schema.defaultValue as number} min={schema.min} max={schema.max}/>
    case 'string':
      return <StringEditor context={context as EditorContext} callback={callback} defaultValue={schema.defaultValue as string}/>
    case 'boolean':
      return <BooleanEditor context={context as EditorContext} callback={callback} defaultValue={schema.defaultValue as boolean}/>
    case 'select':
      return <SelectEditor context={context as EditorContext} callback={callback} options={schema.options as string[]}/>
  }
}

function makeObject(schema: ObjectSchema, {context, callback}: BaseProps): React.ReactElement {
  return <KeyValueEditor callback={callback} entries={schema.fields.map(({key, schema: fieldSchema}) => {
    const { kind, optional, description, note } = fieldSchema
    return {
      key,
      optional,
      description,
      note,
      nested: kind !== 'scalar',
      component: (cb) => loadFromSchema(fieldSchema, {context, callback: cb})
    } as KeyValueEditorEntry
  })}/>
}

function makeReference(schema: ReferenceSchema, {context, callback}: BaseProps): React.ReactElement {
  switch (schema.ref) {
    case 'item_stack': return (
      <ItemStackEditor context={context} callback={callback}/>
    )
  }
}