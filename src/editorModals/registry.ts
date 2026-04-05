import type { EditorComponent } from './types'

const editorRegistry = new Map<string, EditorComponent>()

export function registerEditorModal(editorType: string, component: EditorComponent) {
  editorRegistry.set(editorType, component)
}

export function getEditorModal(editorType: string) {
  return editorRegistry.get(editorType) ?? null
}
