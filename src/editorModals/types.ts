import type * as Blockly from 'blockly'
import type { ComponentType } from 'react'

export type EditorModalRequest = {
  editorType: string
  workspace: Blockly.WorkspaceSvg
  blockId: string
  title?: string
  trigger?: {
    fieldName?: string
    data?: unknown
  }
}

export type EditorBlock = Blockly.BlockSvg & {
  getEditorContext?: (request: EditorModalRequest) => unknown
  applyEditorResult?: (result: unknown, request: EditorModalRequest) => void
}

export type EditorComponentProps = {
  request: EditorModalRequest
  workspace: Blockly.WorkspaceSvg
  block: EditorBlock
  context: unknown
  setPendingResult: (result: unknown) => void
}

export type EditorComponent = ComponentType<EditorComponentProps>
