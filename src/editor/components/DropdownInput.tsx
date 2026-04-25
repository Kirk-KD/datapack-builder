import {useEffect} from "react";
import {Autocomplete, TextField} from "@mui/material";

type DropdownInputProps = {
  className?: string
  disabled?: boolean
  options: string[]
  value?: string
  setValue: (newValue: string) => void
}

export default function DropdownInput({ className, disabled, options, value, setValue }: DropdownInputProps) {
  useEffect(() => {
    if (options) setValue(options[0])
  }, [options, setValue])

  return <Autocomplete
    disablePortal
    options={options}
    value={value}
    renderInput={(params) => <TextField {...params} variant={'outlined'} size={'small'}/>}
    className={className}
    disabled={disabled}
    sx={{
      width: '100%'
    }}
  />
}