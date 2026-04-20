import type {EditorBaseProps} from "../types.ts";
import {useEffect, useState} from "react";
import ResetButton from "../components/ResetButton.tsx";

export type BooleanEditorProps = EditorBaseProps<never, boolean> & {
  defaultValue?: boolean
}

export default function BooleanEditor({ state, setState, defaultValue }: BooleanEditorProps) {
  const [value, setValue] = useState(state.data === undefined ? Boolean(defaultValue) : state.data)

  useEffect(() => {
    if (state.data === undefined) setState({...state, data: Boolean(defaultValue)})
  }, [defaultValue, setState, state])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '0.5rem',
    }} className={'editor'}>
      <input type={'checkbox'} checked={value} onChange={e => {
        setValue(e.target.checked)
        setState({
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