import type {NumberEditorProps} from "../types.ts";
import TextInput from "../components/TextInput.tsx";
import {useState} from "react";

export default function NumberEditor({callback, type, defaultValue, min, max}: NumberEditorProps) {
  const [value, setValue] = useState((defaultValue ?? 0).toString())

  return (
    <TextInput
      defaultValue={(defaultValue ?? 0).toString()}
      value={value}
      setValue={setValue}
      onChange={(value) => {
        let number = Number.parseFloat(value)
        if (type === 'int') number = Math.round(number)

        callback({
          error: false, // TODO validator
          data: number,
          compileValue: () => number.toString()
        })
      }}
    />
  )
}