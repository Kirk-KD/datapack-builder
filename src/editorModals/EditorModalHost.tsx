import { useEffect, useState } from 'react'
import * as Blockly from 'blockly'
import { registerEditorModalController } from './bridge'
import { getEditorModal } from './registry'
import type { EditorBlock, EditorComponentProps, EditorModalRequest } from './types'
import './editors'
import './EditorModalHost.css'

function FallbackEditorModal({ request, block, close }: EditorComponentProps) {
  return (
    <div className="editorModalPlaceholder">
      <p>No editor component is registered for `{request.editorType}`.</p>
      <p>Source block type: `{block.type}`</p>
      <div className="editorModalFooter">
        <div className="editorModalButtonRow">
          <button type="button" className="editorModalButton" onClick={close}>Close</button>
        </div>
      </div>
    </div>
  )
}

function getSourceBlock(request: EditorModalRequest | null): EditorBlock | null {
  if (!request) return null

  const block = request.workspace.getBlockById(request.blockId)
  return block instanceof Blockly.BlockSvg ? block as EditorBlock : null
}

function EditorModalHost() {
  const [request, setRequest] = useState<EditorModalRequest | null>(null)

  useEffect(() => {
    return registerEditorModalController({
      open: setRequest,
      close: () => setRequest(null),
    })
  }, [])

  useEffect(() => {
    if (!request) return

    const listener = () => {
      if (!request.workspace.getBlockById(request.blockId)) {
        setRequest(null)
      }
    }

    request.workspace.addChangeListener(listener)
    return () => request.workspace.removeChangeListener(listener)
  }, [request])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setRequest(null)
      }
    }

    if (!request) return
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [request])

  if (!request) return null

  const activeRequest = request
  const block = getSourceBlock(request)
  if (!block) return null

  const context = block.getEditorContext?.(activeRequest)
  const RegisteredEditor = getEditorModal(activeRequest.editorType) ?? FallbackEditorModal

  function close() {
    setRequest(null)
  }

  function commit(result: unknown) {
    const sourceBlock = getSourceBlock(activeRequest)
    if (!sourceBlock) {
      setRequest(null)
      return
    }

    Blockly.Events.setGroup(true)
    try {
      sourceBlock.applyEditorResult?.(result, activeRequest)
      if (sourceBlock.rendered) {
        sourceBlock.render()
      }
    } finally {
      Blockly.Events.setGroup(false)
    }

    setRequest(null)
  }

  return (
    <div className="editorModalOverlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        close()
      }
    }}>
      <div
        className="editorModalCard"
        role="dialog"
        aria-modal="true"
        aria-label={activeRequest.title ?? 'Editor modal'}
      >
        <div className="editorModalHeader">
          <h2>{activeRequest.title ?? 'Editor'}</h2>
          <div className="editorModalButtonRow">
            <button type="button" className="editorModalButton" onClick={close}>Close</button>
          </div>
        </div>
        <div className="editorModalBody">
          <RegisteredEditor
            request={activeRequest}
            workspace={activeRequest.workspace}
            block={block}
            context={context}
            commit={commit}
            close={close}
          />
        </div>
      </div>
    </div>
  )
}

export default EditorModalHost
