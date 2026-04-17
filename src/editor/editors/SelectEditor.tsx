import type {SelectEditorProps} from "../types.ts";
import {useEffect, useState} from "react";
import ResetButton from "../components/ResetButton.tsx";

export default function SelectEditor({ callback, defaultValue, options }: SelectEditorProps) {
  const defaultVal = (defaultValue && options.includes(defaultValue)) ? defaultValue : options[0]

  const [value, setValue] = useState(defaultVal)

  useEffect(() => {
    callback({
      error: false,
      data: defaultVal
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '0.5rem',
      alignItems: 'center'
    }} className={'editor'}>
      <select
        style={{
          flexGrow: 1
        }}
        value={value}
        onChange={e => {
          setValue(e.target.value)
          callback({
            error: false,
            data: e.target.value
          })
        }}
      >
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
      <ResetButton handleReset={() => setValue(defaultVal)}/>
    </div>
  )
}