import * as React from "react"
import './EditorRow.css'
import EnableCheckbox from "./EnableCheckbox.tsx";
import Tooltip from "../../components/Tooltip.tsx";

type EditorRowProps = {
  label: string
  description?: string
  note?: string
  optional?: boolean
  children: React.ReactElement
  isNested?: boolean
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

/**
 * A row holding the label and input for an `ObjectEditor`.
 */
export default function EditorRow({ label, description, note, optional, children, isNested, enabled, setEnabled }: EditorRowProps ) {
  return (
    <>
      {note && <div className='editorNote'>{note}</div>}

      <div className={`editorRowLabel ${enabled ? '' : 'disabled'}`}>
        <EnableCheckbox show={optional} setEnabled={setEnabled} />
        <Tooltip text={description}>
          <span className={'editorLabelSpan'}>{label}</span>
        </Tooltip>
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