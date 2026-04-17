import type {StringEditorProps} from "../types.ts";
import {useEffect, useState} from "react";
import TextInput from "../components/TextInput.tsx";

export default function StringEditor({ callback, defaultValue, className }: StringEditorProps & {className?: string}) {
  const [value, setValue] = useState(defaultValue || '')

  useEffect(() => {
    callback({
      error: false,
      data: value,
      compileValue: () => value
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TextInput
      defaultValue={defaultValue || ''}
      value={value}
      setValue={setValue}
      className={`editor ${className}`}
      onChange={nextValue => callback({ error: false, data: nextValue, compileValue: () => nextValue})}
    />
  )
}