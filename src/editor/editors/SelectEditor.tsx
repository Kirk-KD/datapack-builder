import {useEffect} from "react";
import ResetButton from "../components/ResetButton.tsx";
import type {EditorBaseProps} from "../types.ts";
import DropdownInput from "../components/DropdownInput.tsx";

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
    <DropdownInput
      options={options}
      value={state.data}
      setValue={newValue => setState({
        compiler: 'scalar',
        error: false,
        data: newValue
      })}
      endAdornment={<ResetButton handleReset={() => setState({...state, data: defaultVal})}/>}
      sx={{
        minWidth: theme => theme.shape.editorInputMinWidth
      }}
    />
  )
}