type DropdownInputProps = {
  className?: string
  disabled?: boolean
  options: string[]
}

export default function DropdownInput({ className, disabled, options }: DropdownInputProps) {
  return (
    <select disabled={disabled} className={className || ''}>
      {options.map(option => <option key={option}>{option}</option>)}
    </select>
  )
}