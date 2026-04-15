import type {NumberEditorProps} from "../types.ts";
import TextInput from "../components/TextInput.tsx";
import {useEffect, useState} from "react";

export default function NumberEditor({callback, type, defaultValue, min, max}: NumberEditorProps) {
  const defaultValueStr = (defaultValue ?? 0).toString()
  const [value, setValue] = useState(defaultValueStr)

  function valid(value: string): boolean {
    const number = Number(value)
    if (Number.isNaN(number)) return false
    if (type === 'int' && !Number.isInteger(number)) return false
    if (min !== undefined && number < min) return false
    if (max !== undefined && number > max) return false
    return true
  }

  function validateAndCallback(value: string) {
    if (valid(value)) {
      const number = Number(value)
      callback({
        error: false,
        data: number,
        compileValue: () => number.toString()
      })
    } else {
      callback({
        error: true
      })
    }
  }

  useEffect(() => validateAndCallback(value), []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TextInput
      defaultValue={defaultValueStr}
      value={value}
      setValue={setValue}
      onChange={validateAndCallback}
    />
  )
}