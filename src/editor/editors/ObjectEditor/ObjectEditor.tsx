import './ObjectEditor.css'
import * as React from "react";
import {type SetStateAction, useCallback, useEffect, useState} from "react";
import type {AnyEditorState, AnyEditorStateCallback, EditorStateMap, EditorState, EditorStateCallback} from "../../types.ts";
import EditorRow from "./EditorRow.tsx";

export type ObjectEditorEntry = {
  key: string
  description?: string
  note?: string
  optional?: boolean
  nested?: boolean
  component: (fieldState: AnyEditorState, setFieldState: AnyEditorStateCallback) => React.ReactElement
}

type ObjectEditorProps = {
  state: EditorState<EditorStateMap>
  setState: EditorStateCallback<EditorStateMap>
  entries: ObjectEditorEntry[]
}

export default function ObjectEditor({ state, setState, entries }: ObjectEditorProps) {
  const [entryStates, setEntryStates] = useState<EditorStateMap>(() =>
    Object.fromEntries(
      entries.map(entry => [
        entry.key,
        (state.data !== undefined && state.data[entry.key] !== undefined) ? state.data[entry.key] : { enabled: entry.optional !== true, error: false }
      ])
    )
  )

  useEffect(() => {
    const enabledEntries = entries.filter(({ key }) => entryStates[key].enabled)

    if (enabledEntries.some(({ key }) => entryStates[key].error)) setState({ ...state, error: true })
    else setState({
      error: false,
      data: Object.fromEntries(enabledEntries.map(({ key }) => [key, entryStates[key]]))
    })
  }, [entryStates]) // eslint-disable-line react-hooks/exhaustive-deps
  // ^Including `callback` and `entries` in the useEffect dependencies causes infinite updates.

  const makeEntryCallback = useCallback((key: string): AnyEditorStateCallback => (result: SetStateAction<AnyEditorState>) => {
    setEntryStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...(typeof result === 'function' ? result(prev[key]) : result)
      }
    }))
  }, [])

  const makeSetEnabled = useCallback((key: string) => (enabled: boolean) =>
    setEntryStates(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled }
    })), [])

  return (
    <div className='editor objectEditor'>
      {entries.map(entry => (
        <EditorRow
          key={entry.key}
          label={entry.key}
          description={entry.description}
          note={entry.note}
          optional={entry.optional}
          isNested={entry.nested}
          enabled={Boolean(entryStates[entry.key].enabled)}
          setEnabled={makeSetEnabled(entry.key)}
        >
          {entry.component(entryStates[entry.key], makeEntryCallback(entry.key))}
        </EditorRow>
      ))}
    </div>
  )
}