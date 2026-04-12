import * as React from "react"

type EnableCheckboxProps = {
  show?: boolean
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

export default function EnableCheckbox({ show, setEnabled }: EnableCheckboxProps) {
  return <input
    type='checkbox'
    className='enableCheckbox'
    style={show ? {} : {visibility: 'hidden'}}
    onChange={(event) => setEnabled(event.target.checked)}
  />
}