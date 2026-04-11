import * as React from "react"
import './EditorRow.css'

type EditorRowProps = {
  label: string
  description?: string
  note?: string
  optional?: boolean
  children: React.ReactElement
}

/**
 * A row holding the label and input for a `KeyValueEditor`.
 */
export default function EditorRow({ label, description, note, optional, children }: EditorRowProps ) {
  return (
    <>
      {note && <div className='editorNote'>{note}</div>}

      <div className='editorRowLabel'>
        {optional && <input type='checkbox' className='enableCheckbox' /> }
        <span>{label}</span>
        {/* TODO add tooltip for description */}
      </div>

      <div className='editorRowInput'>
        {children}
      </div>
    </>
  )
}