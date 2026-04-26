import {Autocomplete, type SxProps, TextField, type Theme} from "@mui/material";
import * as React from "react";

type DropdownInputProps = {
  disabled?: boolean
  options: string[]
  value?: string | null
  setValue: (newValue: string) => void
  endAdornment?: React.ReactNode
}

export default function DropdownInput({ disabled, options, value = null, setValue, sx, endAdornment }: DropdownInputProps & {sx?: SxProps<Theme>}) {
  return <Autocomplete
    disableClearable
    disablePortal
    options={options}
    value={value ?? options[0]}
    onChange={(_, newValue) => {
      if (newValue) setValue(newValue)
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        size="small"
        slotProps={{
          ...params.slotProps,
          input: {
            ...params.slotProps?.input,
            endAdornment: (
              <>
                {params.slotProps?.input.endAdornment}
                {endAdornment}
              </>
            )
          }
        }}
      />
    )}
    disabled={disabled}
    sx={{ width: '100%', ...sx }}
  />
}