import {useMemo, useState} from "react";
import {SnackbarContext} from "./SnackbarContext.tsx";
import * as React from "react";
import type {AlertColor} from '@mui/material'

export function SnackbarProvider({children}: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [severity, setSeverity] = useState<AlertColor>('info')

  const value = useMemo(() => ({
    open,
    setOpen,
    text,
    setText,
    severity,
    setSeverity,
  }), [
    open,
    text,
    severity,
  ])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  )
}
