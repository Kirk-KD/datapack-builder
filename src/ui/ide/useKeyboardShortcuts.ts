import {useIDEContext} from "./context/useIDEContext.ts"
import { useHotkeys } from 'react-hotkeys-hook'
import {actions} from './actions.tsx'

export function useKeyboardShortcuts() {
  const ideContext = useIDEContext()

  useHotkeys('mod+s', () => actions.saveProject(ideContext), { preventDefault: true })
  useHotkeys('mod+o', () => actions.openProject(ideContext), { preventDefault: true })
  useHotkeys('mod+b', () => actions.buildDatapack(ideContext), { preventDefault: true })
  useHotkeys('mod+i', () => actions.inspectOutput(ideContext), { preventDefault: true })

  // `preventDefault` option not working while the others work; `window.addEventListener` doesn't work either.
  // Tested on Firefox and Safari.
  // useHotkeys('mod+n', () => actions.newProject(ideContext), { preventDefault: true })
}
