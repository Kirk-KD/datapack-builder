import type { EditorComponent } from './types'

type EditorRegistration =
  | {
      kind: 'loaded'
      component: EditorComponent
    }
  | {
      kind: 'loader'
      load: () => Promise<EditorComponent>
    }

const editorRegistry = new Map<string, EditorRegistration>()

export function registerEditorModal(editorType: string, component: EditorComponent) {
  editorRegistry.set(editorType, {
    kind: 'loaded',
    component,
  })
}

export function registerLazyEditorModal(editorType: string, load: () => Promise<EditorComponent>) {
  editorRegistry.set(editorType, {
    kind: 'loader',
    load,
  })
}

export async function loadEditorModal(editorType: string) {
  const registration = editorRegistry.get(editorType)
  if (!registration) return null

  if (registration.kind === 'loaded') {
    return registration.component
  }

  const component = await registration.load()
  editorRegistry.set(editorType, {
    kind: 'loaded',
    component,
  })
  return component
}
