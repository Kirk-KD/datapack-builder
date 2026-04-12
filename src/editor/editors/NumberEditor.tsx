import type {NumberEditorProps} from "../types.ts";
import TextInput from "../components/TextInput.tsx";
import {useState} from "react";

export default function NumberEditor({callback, type, defaultValue, min, max}: NumberEditorProps) {
  const defaultValueStr = (defaultValue ?? 0).toString()
  const [value, setValue] = useState(defaultValueStr)

  function parseNumber(value: string): number {
    let number = Number.parseFloat(value)
    if (type === 'int') number = Math.round(number)
    return number
  }

  function valid(value: string): boolean {
    let number = Number.parseFloat(value)
    if (Number.isNaN(number)) return false

    number = parseNumber(value)

    if (min !== undefined && number < min) return false
    if (max !== undefined && number > max) return false

    return true
  }

  return (
    <TextInput
      defaultValue={defaultValueStr}
      value={value}
      setValue={setValue}
      onChange={(value) => {
        if (valid(value)) {
          const number = parseNumber(value)

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
      }}
    />
  )
}