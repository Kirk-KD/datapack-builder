import type { EditorModalRequest } from './types'

export type EditorModalController = {
  open: (request: EditorModalRequest) => void
  close: () => void
}

let controller: EditorModalController | null = null

export function registerEditorModalController(nextController: EditorModalController) {
  controller = nextController

  return () => {
    if (controller === nextController) {
      controller = null
    }
  }
}

export function openEditorModal(request: EditorModalRequest) {
  if (!controller) {
    console.warn('Cannot open editor modal before the modal host is mounted.')
    return false
  }

  controller.open(request)
  return true
}

export function closeEditorModal() {
  controller?.close()
}
