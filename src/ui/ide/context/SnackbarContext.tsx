import type {AlertColor} from '@mui/material'
import * as React from "react";

export type SnackbarContextValue = {
  snackbarOpen: boolean
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>
  snackbarText: string
  setSnackbarText: React.Dispatch<React.SetStateAction<string>>
  snackbarColor: AlertColor
  setSnackbarColor: React.Dispatch<React.SetStateAction<AlertColor>>
}

export const SnackbarContext = React.createContext<SnackbarContextValue | null>(null)

