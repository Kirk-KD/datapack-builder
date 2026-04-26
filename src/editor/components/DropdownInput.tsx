import {useEffect} from "react";
import {Autocomplete, type SxProps, TextField, type Theme} from "@mui/material";

type DropdownInputProps = {
  disabled?: boolean
  options: string[]
  value?: string | null
  setValue: (newValue: string) => void
}

export default function DropdownInput({ disabled, options, value = null, setValue, sx }: DropdownInputProps & {sx?: SxProps<Theme>}) {
  useEffect(() => {
    if (options?.length) setValue(options[0])
  }, [options, setValue])

  return <Autocomplete
    disablePortal
    options={options}
    value={value}
    onChange={(_, newValue) => {
      if (newValue) setValue(newValue)
    }}
    renderInput={(params) => <TextField {...params} variant="outlined" size="small"/>}
    disabled={disabled}
    sx={{ width: '100%', ...sx }}
  />
}