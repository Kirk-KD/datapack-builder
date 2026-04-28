import {useEffect} from "react";
import {useIDEContext} from "./context/useIDEContext.ts";
import {saveProject} from "../../core/save";

export function useKeyboardShortcuts() {
  const {blocklyWorkspaceRef, setHasUnsavedFileChanges} = useIDEContext()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (blocklyWorkspaceRef.current) {
          saveProject({workspace: blocklyWorkspaceRef.current})
          setHasUnsavedFileChanges(false)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [blocklyWorkspaceRef, setHasUnsavedFileChanges])
}