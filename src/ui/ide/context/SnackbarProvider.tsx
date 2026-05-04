import {useMemo, useState} from "react";
import {SnackbarContext} from "./SnackbarContext.tsx";
import * as React from "react";
import type {AlertColor} from '@mui/material'

export function SnackbarProvider({children}: { children: React.ReactNode }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarText, setSnackbarText] = useState('')
  const [snackbarColor, setSnackbarColor] = useState<AlertColor>('info')

  const value = useMemo(() => ({
    snackbarOpen,
    setSnackbarOpen,
    snackbarText,
    setSnackbarText,
    snackbarColor,
    setSnackbarColor,
  }), [
    snackbarOpen,
    snackbarText,
    snackbarColor,
  ])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  )
}

