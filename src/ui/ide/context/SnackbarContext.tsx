import type {AlertColor} from '@mui/material'
import * as React from "react";

export type SnackbarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  text: string
  setText: React.Dispatch<React.SetStateAction<string>>
  severity: AlertColor
  setSeverity: React.Dispatch<React.SetStateAction<AlertColor>>
}

export const SnackbarContext = React.createContext<SnackbarContextValue | null>(null)
