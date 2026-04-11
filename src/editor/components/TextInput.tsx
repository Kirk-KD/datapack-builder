import type { ChangeEventHandler } from "react"
import './TextInput.css'
import './inputContainer.css'
import * as React from "react"

type TextInputProps = {
  defaultValue: string
  value: string
  setValue: React.Dispatch<string>
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function TextInput({ defaultValue, value, setValue, onChange, disabled, placeholder }: TextInputProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleReset = () => {
    setValue(defaultValue)
    onChange?.(defaultValue)
  }

  return (
    <div className='inputContainer'>
      <input
        type='text'
        className='textInput'
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
      />
      <button onClick={handleReset} disabled={disabled} className='resetButton'>↺</button>
    </div>
  )
}