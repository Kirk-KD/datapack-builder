import {useIDEContext} from "./context/useIDEContext.ts"
import {saveProject} from "../../core/save"
import { useHotkeys } from 'react-hotkeys-hook'

export function useKeyboardShortcuts() {
  const {blocklyWorkspaceRef, setHasUnsavedFileChanges} = useIDEContext()

  useHotkeys('mod+s', () => {
    if (blocklyWorkspaceRef.current) {
      saveProject({workspace: blocklyWorkspaceRef.current})
      setHasUnsavedFileChanges(false)
    }
  })

  useHotkeys('mod+o', () => {
    // TODO open project
  })

  useHotkeys('mod+n', () => {
    // TODO new project
  })

  useHotkeys('mod+b', () => {
    // TODO build project
  })

  useHotkeys('mod+i', () => {
    // TODO inspect output
  })
}