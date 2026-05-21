import TextInput from "../components/TextInput.tsx";
import {useCallback, useEffect, useState} from "react";
import type {EditorBaseProps, RegistryReferenceOption} from "../../../core/editor";
import type {SxProps, Theme} from "@mui/material";
import {RegistryReferenceButton} from '../components/RegistryReferenceButton.tsx'
import {getBlockColours} from '../../../core/blockly'

export type NumberEditorProps = EditorBaseProps<never, number> & {
  type: 'int' | 'long' | 'float' | 'double'
  defaultValue?: number
  min?: number
  max?: number
  getRegistryReferenceOptions?: () => RegistryReferenceOption<'constant' | 'parameter'>[]
}

type NumberEditorStateWithRegistry = NumberEditorProps['state'] & {
  registryReference?: RegistryReferenceOption | null
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
  const stateWithRegistry = state as NumberEditorStateWithRegistry
  const defaultValueStr = (defaultValue ?? 0).toString()
  const [value, setValue] = useState(state.data === undefined ? defaultValueStr : state.data.toString())
  const [hasError, setHasError] = useState(false)

  const [selectedRegRef, setSelectedRegRef] = useState<RegistryReferenceOption | null>(stateWithRegistry.registryReference ?? null)

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
    if (selectedRegRef) {
      setState(prev => ({
        ...(prev as NumberEditorStateWithRegistry),
        compiler: 'scalar',
        error: false,
        data: prev.data ?? Number(defaultValueStr),
        registryReference: selectedRegRef,
      }) as NumberEditorProps['state'])
      return false
    }

    if (valid(value)) {
      setState({
        compiler: 'scalar',
        error: false,
        data: Number(value),
        registryReference: undefined,
      } as NumberEditorProps['state'])
      return false
    } else {
      setState(prev => ({
        ...(prev as NumberEditorStateWithRegistry),
        error: true,
        registryReference: undefined,
      }) as NumberEditorProps['state'])
      return true
    }
  }, [defaultValueStr, selectedRegRef, setState, valid])

  useEffect(() => {
    if (state.data === undefined) validateAndCallback(defaultValueStr)
  }, [defaultValueStr, state.data, validateAndCallback])

  const handleSelectedRegRefChange = useCallback((nextRegRef: RegistryReferenceOption | null) => {
    setSelectedRegRef(nextRegRef)
    if (nextRegRef) setHasError(false)

    setState(prev => {
      const prevWithRegistry = prev as NumberEditorStateWithRegistry
      if (nextRegRef) {
        return {
          ...prevWithRegistry,
          compiler: 'scalar',
          error: false,
          data: prevWithRegistry.data ?? Number(defaultValueStr),
          registryReference: nextRegRef,
        } as NumberEditorProps['state']
      }

      if (prevWithRegistry.registryReference === undefined || prevWithRegistry.registryReference === null) {
        return prev
      }

      return {
        ...prevWithRegistry,
        registryReference: undefined,
      } as NumberEditorProps['state']
    })
  }, [defaultValueStr, setState])

  return (
    <TextInput
      defaultValue={defaultValueStr}
      value={selectedRegRef ? selectedRegRef.readableName : value}
      setValue={setValue}
      onChange={(nextValue) => setHasError(validateAndCallback(nextValue))}
      hasError={selectedRegRef ? false : hasError}
      sx={{
        ...sx,
        ...(selectedRegRef ? {
          '& input': {
            background: selectedRegRef.type === 'constant' ? getBlockColours().constants : getBlockColours().procedures,
            borderRadius: '9999px',
            color: 'white',
            p: 0.5,
            pl: 1.5,
            pr: 0,
            m: 0.5,
          },
        } : {}),
      }}
      endAdornment={
        getRegistryReferenceOptions ? (
          <RegistryReferenceButton
            selectedRegRef={selectedRegRef}
            setSelectedRegRef={handleSelectedRegRefChange}
            options={getRegistryReferenceOptions()}
          />
        ) : undefined
      }
      handleReset={() => handleSelectedRegRefChange(null)}
    />
  )
}
