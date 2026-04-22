import {useEffect} from "react";

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

  return (
    <select disabled={disabled} className={className || ''} value={value} onChange={e => setValue(e.target.value)}>
      {options.map(option => <option key={option}>{option}</option>)}
    </select>
  )
}