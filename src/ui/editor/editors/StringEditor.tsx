import TextInput from "../components/TextInput.tsx";
import {useEffect} from "react";
import type {EditorBaseProps} from "../../../core/editor";

export type StringEditorProps = EditorBaseProps<never, string> & {
  defaultValue?: string
  multiline?: boolean
  /* Return true if valid. */
  validate?: (value: string) => boolean
}

export default function StringEditor({ state, setState, defaultValue, multiline, validate }: StringEditorProps) {
  useEffect(() => {
    if (state.data === undefined) setState({...state, data: defaultValue ?? ''})
  }, [defaultValue, setState, state]);

  return (
    <TextInput
      multiline={multiline}
      defaultValue={defaultValue || ''}
      value={state.data ?? ''}
      setValue={value => setState({
        compiler: 'scalar',
        error: validate ? !validate(value) : false,
        data: value
      })}
      hasError={state.error}
      sx={multiline ? {
        minWidth: theme => theme.shape.editorMultilineStringInputMinWidth,
        maxWidth: theme => theme.shape.editorMultilineStringInputMaxWidth
      } : undefined}
    />
  )
}