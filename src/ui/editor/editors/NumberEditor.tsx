import TextInput from "../components/TextInput.tsx";
import {useCallback, useEffect, useState} from "react";
import type {EditorBaseProps} from "../../../core/editor";
import type {SxProps, Theme} from "@mui/material";

export type NumberEditorProps = EditorBaseProps<never, number> & {
  type: 'int' | 'long' | 'float' | 'double'
  defaultValue?: number
  min?: number
  max?: number
}

export default function NumberEditor({state, setState, type, defaultValue, min, max, sx}: NumberEditorProps & {sx?: SxProps<Theme>}) {
  const defaultValueStr = (defaultValue ?? 0).toString()
  const [value, setValue] = useState(state.data === undefined ? defaultValueStr : state.data.toString())
  const [hasError, setHasError] = useState(false)

  const valid = useCallback((value: string): boolean => {
    if (value === '') return false
    const number = Number(value)
    if (Number.isNaN(number)) return false
    if (type === 'int' && !Number.isInteger(number)) return false
    if (min !== undefined && number < min) return false
    if (max !== undefined && number > max) return false
    return true
  }, [max, min, type])

  // Validate, callback, then returns whether there is an error
  const validateAndCallback = useCallback((value: string): boolean => {
    if (valid(value)) {
      setState({
        compiler: 'scalar',
        error: false,
        data: Number(value),
      })
      return false
    } else {
      setState({
        ...state,
        error: true
      })
      return true
    }
  }, [setState, state, valid])

  useEffect(() => {
    if (state.data === undefined) validateAndCallback(defaultValueStr)
  }, [defaultValueStr, state.data, validateAndCallback])

  return (
    <TextInput
      defaultValue={defaultValueStr}
      value={value}
      setValue={setValue}
      onChange={(nextValue) => setHasError(validateAndCallback(nextValue))}
      hasError={hasError}
      sx={sx}
    />
  )
}