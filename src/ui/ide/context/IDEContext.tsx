import type {WorkspaceSvg} from "blockly";
import * as React from "react";
import type {OutputZip} from "../../../core/output-preview";
import type {AlertColor} from '@mui/material'

export type IDEContextValue = {
  blocklyDivRef: React.RefObject<HTMLDivElement | null>
  blocklyWorkspaceRef: React.RefObject<WorkspaceSvg | null>

  hasUnsavedChanges: boolean
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>
  hasUnsavedFileChanges: boolean
  setHasUnsavedFileChanges: React.Dispatch<React.SetStateAction<boolean>>

  outputViewerOpen: boolean
  setOutputViewerOpen: React.Dispatch<React.SetStateAction<boolean>>

  snackbarOpen: boolean
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>
  snackbarText: string
  setSnackbarText: React.Dispatch<React.SetStateAction<string>>
  snackbarColor: AlertColor
  setSnackbarColor: React.Dispatch<React.SetStateAction<AlertColor>>

  compiledOutput: OutputZip | null
  setCompiledOutput: React.Dispatch<React.SetStateAction<OutputZip | null>>
}

export const IDEContext = React.createContext<IDEContextValue | null>(null)
