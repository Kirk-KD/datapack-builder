import { useHotkeys } from 'react-hotkeys-hook'
import {useActions} from './useActions.tsx'

export function useKeyboardShortcuts() {
  const actions = useActions()

  useHotkeys('mod+s', () => actions.saveProject(), { preventDefault: true })
  useHotkeys('mod+o', () => actions.openProject(), { preventDefault: true })
  useHotkeys('mod+b', () => actions.buildDatapack(), { preventDefault: true })
  useHotkeys('mod+i', () => actions.inspectOutput(), { preventDefault: true })

  // `preventDefault` option not working while the others work; `window.addEventListener` doesn't work either.
  // Tested on Firefox and Safari.
  // useHotkeys('mod+n', () => actions.newProject(), { preventDefault: true })
}
