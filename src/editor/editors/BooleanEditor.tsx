import type {EditorBaseProps} from "../types.ts";
import {useEffect, useState} from "react";
import ResetButton from "../components/ResetButton.tsx";
import {Stack, ToggleButton, ToggleButtonGroup} from "@mui/material";

export type BooleanEditorProps = EditorBaseProps<never, boolean> & {
  defaultValue?: boolean
}

export default function BooleanEditor({ state, setState, defaultValue }: BooleanEditorProps) {
  const [value, setValue] = useState(state.data === undefined ? Boolean(defaultValue) : state.data)

  useEffect(() => {
    if (state.data === undefined) setState({...state, data: Boolean(defaultValue)})
  }, [defaultValue, setState, state])

  const handleChange = (_: React.MouseEvent, newValue: boolean | null) => {
    if (newValue === null) return // prevent deselecting
    setValue(newValue)
    setState({ compiler: 'scalar', error: false, data: newValue })
  }

  const handleReset = () => {
    const resetValue = Boolean(defaultValue)
    setValue(resetValue)
    setState({ compiler: 'scalar', error: false, data: resetValue })
  }

  return (
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        size="small"
      >
        <ToggleButton value={true} sx={{ width: '3rem' }}>true</ToggleButton>
        <ToggleButton value={false} sx={{ width: '3rem' }}>false</ToggleButton>
      </ToggleButtonGroup>
      <ResetButton handleReset={handleReset} />
    </Stack>
  )
}