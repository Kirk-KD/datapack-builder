import './KeyValueEditor.css'
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import type {EditorResult, EditorResultCallback} from "../../types.ts";
import EditorRow from "./EditorRow.tsx";

export type KeyValueEditorEntry = {
  key: string
  description?: string
  note?: string
  optional?: boolean
  nested?: boolean
  component: (callback: EditorResultCallback<unknown>) => React.ReactElement
}

type KeyValueEditorProps = {
  callback: EditorResultCallback<Record<string, unknown>>
  entries: KeyValueEditorEntry[]
}

export default function KeyValueEditor({ callback, entries }: KeyValueEditorProps) {
  const [entryStates, setEntryStates] = useState<Record<string, { enabled: boolean; data: unknown; error: boolean }>>(() =>
    Object.fromEntries(
      entries.map(entry => [
        entry.key,
        { enabled: entry.optional !== true, data: null, error: false }
      ])
    )
  )

  useEffect(() => {
    const enabledEntries = entries.filter(({ key }) => entryStates[key].enabled)

    if (enabledEntries.some(({ key }) => entryStates[key].error)) callback({ error: true })
    else callback({
      error: false,
      data: Object.fromEntries(enabledEntries.map(({ key }) => [key, entryStates[key].data]))
    })
  }, [entryStates]) // eslint-disable-line react-hooks/exhaustive-deps
  // ^Including `callback` and `entries` in the useEffect dependencies causes infinite updates.

  const makeEntryCallback = useCallback((key: string) => (result: EditorResult<unknown>) => {
    setEntryStates(prev => ({
      ...prev,
      [key]: { ...prev[key], data: result.data, error: result.error }
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
          enabled={entryStates[entry.key].enabled}
          setEnabled={makeSetEnabled(entry.key)}
        >
          {entry.component(makeEntryCallback(entry.key))}
        </EditorRow>
      ))}
    </div>
  )
}