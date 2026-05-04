import {useMemo, useState} from "react";
import {useAutosave} from "../useAutosave.ts";
import useBlocklyWorkspace from "../WorkspacePanel/useBlocklyWorkspace.tsx";
import {IDEContext} from "./IDEContext.tsx";
import * as React from "react";
import type {OutputZip} from "../../../core/output-preview";
import type {AlertColor} from '@mui/material'

export function IDEProvider({children}: { children: React.ReactNode }) {
  const {blocklyDivRef, blocklyWorkspaceRef} = useBlocklyWorkspace()

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasUnsavedFileChanges, setHasUnsavedFileChanges] = useState(false)

  const [outputViewerOpen, setOutputViewerOpen] = useState(false)

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')
  const [snackbarColor, setSnackbarColor] = useState<AlertColor>('info')

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
    snackbarOpen,
    setSnackbarOpen,
    snackbarText,
    setSnackbarText,
    snackbarColor,
    setSnackbarColor,
    compiledOutput,
    setCompiledOutput
  }), [
    blocklyDivRef,
    blocklyWorkspaceRef,
    hasUnsavedChanges,
    hasUnsavedFileChanges,
    outputViewerOpen,
    snackbarOpen,
    snackbarText,
    snackbarColor,
    compiledOutput
  ])

  return (
    <IDEContext.Provider value={value}>
      {children}
    </IDEContext.Provider>
  )
}

