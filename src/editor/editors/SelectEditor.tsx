import {useEffect} from "react";
import ResetButton from "../components/ResetButton.tsx";
import type {EditorBaseProps} from "../types.ts";

export type SelectEditorProps = EditorBaseProps<never, string> & {
  defaultValue?: string
  options: string[]
}

export default function SelectEditor({ state, setState, defaultValue, options }: SelectEditorProps) {
  const defaultVal = (defaultValue && options.includes(defaultValue)) ? defaultValue : options[0]

  useEffect(() => {
    if (state.data === undefined) setState({...state, data: defaultVal})
  }, [defaultVal, setState, state]);

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
        value={state.data}
        onChange={e => {
          // setValue(e.target.value)
          setState({
            compiler: 'scalar',
            error: false,
            data: e.target.value
          })
        }}
      >
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
      <ResetButton handleReset={() => setState({...state, data: defaultVal})}/>
    </div>
  )
}