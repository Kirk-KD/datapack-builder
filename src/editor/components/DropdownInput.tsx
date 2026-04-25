import {useEffect} from "react";
import {Autocomplete, type SxProps, TextField, type Theme} from "@mui/material";

type DropdownInputProps = {
  disabled?: boolean
  options: string[]
  value?: string
  setValue: (newValue: string) => void
}

export default function DropdownInput({ disabled, options, value, setValue, sx }: DropdownInputProps & {sx?: SxProps<Theme>}) {
  useEffect(() => {
    if (options) setValue(options[0])
  }, [options, setValue])

  return <Autocomplete
    disablePortal
    options={options}
    value={value}
    renderInput={(params) => <TextField {...params} variant={'outlined'} size={'small'}/>}
    disabled={disabled}
    sx={{
      ...sx,
      width: '100%'
    }}
  />
}