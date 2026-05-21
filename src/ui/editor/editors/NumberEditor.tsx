import TextInput from "../components/TextInput.tsx";
import {useCallback, useEffect, useState} from "react";
import type {EditorBaseProps, RegistryReferenceOption} from "../../../core/editor";
import type {SxProps, Theme} from "@mui/material";
import {RegistryReferenceButton} from '../components/RegistryReferenceButton.tsx'

export type NumberEditorProps = EditorBaseProps<never, number> & {
  type: 'int' | 'long' | 'float' | 'double'
  defaultValue?: number
  min?: number
  max?: number
  getRegistryReferenceOptions?: () => RegistryReferenceOption<'constant' | 'parameter'>[]
}

export default function NumberEditor(
  {
    state,
    setState,
    type,
    defaultValue,
    min,
    max,
    sx,
    getRegistryReferenceOptions,
  }: NumberEditorProps & {sx?: SxProps<Theme>}
) {
  const defaultValueStr = (defaultValue ?? 0).toString()
  const [value, setValue] = useState(state.data === undefined ? defaultValueStr : state.data.toString())
  const [hasError, setHasError] = useState(false)

  const [selectedRegRef, setSelectedRegRef] = useState<RegistryReferenceOption | null>(null)

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

  // TODO placeholder
  if (getRegistryReferenceOptions) {
    console.log(getRegistryReferenceOptions())
  }

  return (
    <TextInput
      defaultValue={defaultValueStr}
      value={value}
      setValue={setValue}
      onChange={(nextValue) => setHasError(validateAndCallback(nextValue))}
      hasError={hasError}
      sx={sx}
      endAdornment={
        getRegistryReferenceOptions ? (
          <RegistryReferenceButton
            selectedRegRef={selectedRegRef}
            setSelectedRegRef={setSelectedRegRef}
            options={getRegistryReferenceOptions()}
          />
        ) : undefined
      }
      handleReset={() => setSelectedRegRef(null)}
    />
  )
}