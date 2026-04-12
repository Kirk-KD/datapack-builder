import * as React from "react"
import './EditorRow.css'
import EnableCheckbox from "./EnableCheckbox.tsx";
import {useState} from "react";

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
  const [enabled, setEnabled] = useState(!optional)

  return (
    <>
      {note && <div className='editorNote'>{note}</div>}

      <div className={`editorRowLabel ${enabled ? '' : 'disabled'}`}>
        <EnableCheckbox show={optional} setEnabled={setEnabled} />
        <span>{label}</span>
        {/* TODO add tooltip for description */}
      </div>

      <div
        className={`editorRowInput ${enabled ? '' : 'disabled'}`}
        style={isNested ? {
          backgroundColor: `rgba(0, 0, 0, 10%)`,
          borderRadius: 'var(--border-radius-small)',
          border: '1px solid var(--colour-border-muted)'
        } : {}}
        inert={!enabled}
      >
        {children}
      </div>
    </>
  )
}