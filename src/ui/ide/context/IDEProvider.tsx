import {useMemo, useState} from "react";
import {useAutosave} from "../useAutosave.ts";
import useBlocklyWorkspace from "../WorkspacePanel/useBlocklyWorkspace.ts";
import {IDEContext} from "./IDEContext.tsx";
import * as React from "react";
import type {OutputZip} from "../../../core/output-preview";

export function IDEProvider({children}: { children: React.ReactNode }) {
  const {blocklyDivRef, blocklyWorkspaceRef} = useBlocklyWorkspace()

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasUnsavedFileChanges, setHasUnsavedFileChanges] = useState(false)

  const [outputViewerOpen, setOutputViewerOpen] = useState(false)

  const [compiledOutput, setCompiledOutput] = useState<OutputZip | null>(null)

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
    compiledOutput,
    setCompiledOutput
  }), [blocklyDivRef, blocklyWorkspaceRef, hasUnsavedChanges, hasUnsavedFileChanges, outputViewerOpen, compiledOutput])

  return (
    <IDEContext.Provider value={value}>
      {children}
    </IDEContext.Provider>
  )
}

