import {useMemo, useState} from "react";
import {useAutosave} from "../useAutosave.ts";
import useBlocklyWorkspace from "../WorkspacePanel/useBlocklyWorkspace.ts";
import {IDEContext} from "./IDEContext.tsx";
import * as React from "react";

export function IDEProvider({children}: { children: React.ReactNode }) {
  const {blocklyDivRef, blocklyWorkspaceRef} = useBlocklyWorkspace()

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasUnsavedFileChanges, setHasUnsavedFileChanges] = useState(false)

  const [outputViewerOpen, setOutputViewerOpen] = useState(false)

  useAutosave(blocklyWorkspaceRef, setHasUnsavedChanges, setHasUnsavedFileChanges)

  const value = useMemo(() => ({
    blocklyDivRef,
    blocklyWorkspaceRef,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    hasUnsavedFileChanges,
    setHasUnsavedFileChanges,
    outputViewerOpen,
    setOutputViewerOpen,
  }), [blocklyDivRef, blocklyWorkspaceRef, hasUnsavedChanges, hasUnsavedFileChanges, outputViewerOpen])

  return (
    <IDEContext.Provider value={value}>
      {children}
    </IDEContext.Provider>
  )
}

