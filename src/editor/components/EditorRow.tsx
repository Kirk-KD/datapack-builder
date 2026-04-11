import * as React from "react"
import './EditorRow.css'
import EnableCheckbox from "./EnableCheckbox.tsx";

type EditorRowProps = {
  label: string
  description?: string
  note?: string
  optional?: boolean
  children: React.ReactElement
  isNested?: boolean
}

/**
 * A row holding the label and input for a `KeyValueEditor`.
 */
export default function EditorRow({ label, description, note, optional, children, isNested }: EditorRowProps ) {
  return (
    <>
      {note && <div className='editorNote'>{note}</div>}

      <div className='editorRowLabel'>
        <EnableCheckbox show={optional} />
        <span>{label}</span>
        {/* TODO add tooltip for description */}
      </div>

      <div style={isNested ? {
        backgroundColor: `rgba(0, 0, 0, 10%)`,
        borderRadius: 'var(--border-radius-small)',
        border: '1px solid var(--colour-border-muted)'
      } : {}}>
        {children}
      </div>
    </>
  )
}