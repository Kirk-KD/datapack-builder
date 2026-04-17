import type {BooleanEditorProps} from "../types.ts";
import {useEffect, useState} from "react";
import ResetButton from "../components/ResetButton.tsx";

export default function BooleanEditor({ callback, defaultValue }: BooleanEditorProps) {
  const [value, setValue] = useState(Boolean(defaultValue))

  useEffect(() => {
    callback({
      error: false,
      data: Boolean(defaultValue)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <input type={'checkbox'} checked={value} onChange={e => {
        setValue(e.target.checked)
        callback({
          error: false,
          data: e.target.checked
        })
      }}/>
      <span style={{
        flexGrow: 1
      }}>{value ? 'true' : 'false'}</span>
      <ResetButton handleReset={() => setValue(Boolean(defaultValue))}/>
    </div>
  )
}