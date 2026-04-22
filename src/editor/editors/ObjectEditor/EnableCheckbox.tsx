type EnableCheckboxProps = {
  show?: boolean
  setEnabled: (enabled: boolean) => void
}

export default function EnableCheckbox({ show, setEnabled }: EnableCheckboxProps) {
  return <input
    type='checkbox'
    className='enableCheckbox'
    style={show ? {} : {visibility: 'hidden'}}
    onChange={(event) => setEnabled(event.target.checked)}
  />
}