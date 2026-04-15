import type { ChangeEventHandler } from "react"
import './TextInput.css'
import * as React from "react"
import ResetButton from "./ResetButton.tsx";

type TextInputProps = {
  defaultValue: string
  value: string
  setValue: React.Dispatch<string>
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  hasError?: boolean
  className?: string
}

export default function TextInput({ defaultValue, value, setValue, onChange, disabled, placeholder, hasError, className }: TextInputProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleReset = () => {
    setValue(defaultValue)
    onChange?.(defaultValue)
  }

  return (
    <div className={`inputContainer ${className || ''}`}>
      <input
        type='text'
        className={`textInput ${hasError ? 'hasError' : ''}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
      />
      <ResetButton handleReset={handleReset} disabled={disabled} />
    </div>
  )
}