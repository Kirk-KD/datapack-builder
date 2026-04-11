import './EditorModal.css'
import {controller, useEditorModal} from "./controller.ts";

function MaximizeButton({ maximized }: { maximized: boolean }) {
  return (
    <button
      className="maximizeButton"
      onClick={() => controller.setMaximized(!maximized)}
    >
      <img
        src={maximized ? '/minimize.svg' : '/maximize.svg'}
        alt={maximized ? 'minimize button' : 'maximize button'}
        width="20"
        height="20"
      />
    </button>
  )
}

function EditorModal() {
  const { open, maximized, payload } = useEditorModal()

  if (!open || !payload) return null

  return <div className={`editorModal ${maximized ? 'maximized' : ''}`}>
    <div className={'editorModalHeader'}>
      <div className={'editorModalTitle'}>{payload.title}</div>
      <MaximizeButton maximized={maximized}/>
    </div>
    <div className={'editorModalBody'}>
      {payload.editor}
    </div>
    <div className={'editorModalFooter'}>
      <button
        className='cancelButton'
      >Cancel</button>
      <button
        className='saveButton'
      >Save</button>
    </div>
  </div>
}

export default EditorModal