import { useEffect, useState } from 'react'
import * as Blockly from 'blockly'
import { registerEditorModalController } from './bridge'
import { loadEditorModal } from './registry'
import type { EditorBlock, EditorComponent, EditorComponentProps, EditorModalRequest } from './types'
import './editors'
import './EditorModalHost.css'

function FallbackEditorModal({ request, block }: EditorComponentProps) {
  return (
    <div className="editorModalPlaceholder">
      <p>No editor component is registered for `{request.editorType}`.</p>
      <p>Source block type: `{block.type}`</p>
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
  const [pendingResult, setPendingResult] = useState<unknown>(null)
  const [loadedEditor, setLoadedEditor] = useState<EditorComponent | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!request) {
      setLoadedEditor(null)
      return
    }

    loadEditorModal(request.editorType).then((component) => {
      if (cancelled) return
      setLoadedEditor(() => component)
    })

    return () => {
      cancelled = true
    }
  }, [request])

  useEffect(() => {
    return registerEditorModalController({
      open: (nextRequest) => {
        setPendingResult(null)
        setRequest(nextRequest)
      },
      close: () => {
        setPendingResult(null)
        setRequest(null)
      },
    })
  }, [])

  useEffect(() => {
    if (!request) return

    const listener = () => {
      if (!request.workspace.getBlockById(request.blockId)) {
        setPendingResult(null)
        setRequest(null)
      }
    }

    request.workspace.addChangeListener(listener)
    return () => request.workspace.removeChangeListener(listener)
  }, [request])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPendingResult(null)
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
  const RegisteredEditor = loadedEditor ?? FallbackEditorModal

  function close() {
    setPendingResult(null)
    setRequest(null)
  }

  function save() {
    const sourceBlock = getSourceBlock(activeRequest)
    if (!sourceBlock) {
      setPendingResult(null)
      setRequest(null)
      return
    }

    Blockly.Events.setGroup(true)
    try {
      sourceBlock.applyEditorResult?.(pendingResult, activeRequest)
      if (sourceBlock.rendered) {
        sourceBlock.render()
      }
    } finally {
      Blockly.Events.setGroup(false)
    }

    setPendingResult(null)
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
        </div>
        <div className="editorModalBody">
          {loadedEditor === null ? (
            <div className="editorModalStatusPanel">Loading editor...</div>
          ) : (
            <RegisteredEditor
              request={activeRequest}
              workspace={activeRequest.workspace}
              block={block}
              context={context}
              setPendingResult={setPendingResult}
            />
          )}
        </div>
        <div className="editorModalFooter">
          <div className="editorModalButtonRow">
            <button type="button" className="editorModalButton" onClick={close}>Cancel</button>
            <button type="button" className="editorModalButton" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorModalHost
