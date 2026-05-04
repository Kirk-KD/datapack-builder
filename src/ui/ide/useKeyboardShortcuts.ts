import {useIDEContext} from "./context/useIDEContext.ts"
import { useHotkeys } from 'react-hotkeys-hook'
import {actions} from './actions.tsx'

export function useKeyboardShortcuts() {
  const ideContext = useIDEContext()

  useHotkeys('mod+s', () => actions.saveProject(ideContext), { preventDefault: true })
  useHotkeys('mod+o', () => actions.openProject(ideContext), { preventDefault: true })
  useHotkeys('mod+b', () => actions.buildDatapack(ideContext), { preventDefault: true })
  useHotkeys('mod+i', () => {
    // TODO inspect output
  }, { preventDefault: true })

  // `preventDefault` not working while the others work; `window.addEventListener` for meta/ctrl+n doesn't work either.
  // useHotkeys('mod+n', () => actions.newProject(ideContext), { preventDefault: true })
}