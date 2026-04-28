import {useMemo, useState} from "react";
import {useAutosave} from "../WorkspacePanel/useAutosave.ts";
import useBlocklyWorkspace from "../WorkspacePanel/useBlocklyWorkspace.ts";
import {IDEContext} from "./IDEContext.tsx";
import * as React from "react";

export function IDEProvider({children}: { children: React.ReactNode }) {
  const {blocklyDivRef, blocklyWorkspaceRef} = useBlocklyWorkspace()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [outputViewerOpen, setOutputViewerOpen] = useState(false)

  useAutosave(blocklyWorkspaceRef, setHasUnsavedChanges)

  const value = useMemo(() => ({
    blocklyDivRef,
    blocklyWorkspaceRef,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    outputViewerOpen,
    setOutputViewerOpen,
  }), [blocklyDivRef, blocklyWorkspaceRef, hasUnsavedChanges, outputViewerOpen])

  return (
    <IDEContext.Provider value={value}>
      {children}
    </IDEContext.Provider>
  )
}

