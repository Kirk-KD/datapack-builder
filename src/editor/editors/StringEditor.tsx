import TextInput from "../components/TextInput.tsx";
import {useEffect} from "react";
import type {EditorBaseProps} from "../types.ts";

export type StringEditorProps = EditorBaseProps<never, string> & {
  defaultValue?: string
}

export default function StringEditor({ state, setState, defaultValue, className }: StringEditorProps & {className?: string}) {
  useEffect(() => {
    if (state.data === undefined) setState({...state, data: defaultValue ?? ''})
  }, [defaultValue, setState, state]);

  return (
    <TextInput
      defaultValue={defaultValue || ''}
      value={state.data ?? ''}
      setValue={value => setState({
        compiler: 'scalar',
        error: false,
        data: value
      })}
      className={`editor ${className}`}
      sx={{
        minWidth: theme => theme.shape.editorInputMinWidth,
        maxWidth: theme => theme.shape.editorInputMaxWidth
      }}
    />
  )
}