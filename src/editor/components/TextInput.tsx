import { type ChangeEventHandler, forwardRef } from "react"
import * as React from "react"
import ResetButton from "./ResetButton.tsx"
import {InputAdornment, Stack, type SxProps, TextField, type TextFieldProps, type Theme} from "@mui/material"

type TextInputProps = Omit<TextFieldProps, 'onChange' | 'value' | 'defaultValue'> & {
  defaultValue: string
  value: string
  setValue: React.Dispatch<string>
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  hasError?: boolean
  sx?: SxProps<Theme>
  startAdornment?: React.ReactNode
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((
  { defaultValue, value, setValue, onChange, disabled, hasError, sx, startAdornment, ...rest },
  ref
) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleReset = () => {
    setValue(defaultValue)
    onChange?.(defaultValue)
  }

  return (
    <Stack direction="row" sx={{ ...sx, alignItems: 'center' }}>
      <TextField
        {...rest}
        inputRef={ref}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        size="small"
        error={hasError}
        sx={{ flex: 1 }}
        slotProps={{
          input: {
            startAdornment: startAdornment ? (
              <InputAdornment position="start" sx={{ ml: -1.5 }}>
                {startAdornment}
              </InputAdornment>
            ) : undefined,
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: -1.5 }}>
                <ResetButton handleReset={handleReset} disabled={disabled} />
              </InputAdornment>
            )
          }
        }}
      />
    </Stack>
  )
})

export default TextInput