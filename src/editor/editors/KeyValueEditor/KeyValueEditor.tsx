import './KeyValueEditor.css'
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import type {EditorState, EditorStateCallback} from "../../types.ts";
import EditorRow from "./EditorRow.tsx";

export type KeyValueEditorEntry = {
  key: string
  description?: string
  note?: string
  optional?: boolean
  nested?: boolean
  component: (fieldState: EditorState<unknown>, setFieldState: EditorStateCallback<unknown>) => React.ReactElement
}

type KeyValueEditorProps = {
  state: EditorState<Record<string, EditorState<unknown>>>
  setState: EditorStateCallback<Record<string, EditorState<unknown>>>
  entries: KeyValueEditorEntry[]
}

export default function KeyValueEditor({ state, setState, entries }: KeyValueEditorProps) {
  const [entryStates, setEntryStates] = useState<Record<string, EditorState<unknown>>>(() =>
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

  const makeEntryCallback = useCallback((key: string) => (result: EditorState<unknown>) => {
    setEntryStates(prev => ({
      ...prev,
      [key]: { ...prev[key], ...result }
    }))
  }, [])

  const makeSetEnabled = useCallback((key: string) => (enabled: boolean) =>
    setEntryStates(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled }
    })), [])

  return (
    <div className='editor keyValueEditor'>
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
          {entry.component(entryStates[entry.key], makeEntryCallback(entry.key) as EditorStateCallback<unknown>)}
        </EditorRow>
      ))}
    </div>
  )
}