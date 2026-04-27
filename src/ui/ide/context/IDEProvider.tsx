import {useMemo, useState} from "react";
import {useAutosave} from "../../workspace/useAutosave.ts";
import useBlocklyWorkspace from "../../workspace/useBlocklyWorkspace.ts";
import {IDEContext} from "./IDEContext.tsx";
import * as React from "react";

export function IDEProvider({children}: { children: React.ReactNode }) {
  const {blocklyDivRef, blocklyWorkspaceRef} = useBlocklyWorkspace()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useAutosave(blocklyWorkspaceRef, setHasUnsavedChanges)

  const value = useMemo(() => ({
    blocklyDivRef,
    blocklyWorkspaceRef,
    hasUnsavedChanges,
    setHasUnsavedChanges
  }), [blocklyDivRef, blocklyWorkspaceRef, hasUnsavedChanges])

  return (
    <IDEContext.Provider value={value}>
      {children}
    </IDEContext.Provider>
  )
}

