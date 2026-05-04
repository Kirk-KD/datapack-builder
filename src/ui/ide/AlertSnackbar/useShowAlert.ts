import type {AlertColor} from '@mui/material'
import {useSnackbarContext} from '../context/useSnackbarContext.ts'

export function useShowAlert() {
  const {setSnackbarOpen, setSnackbarText, setSnackbarColor} = useSnackbarContext()

  return (text: string, color?: AlertColor) => {
    setSnackbarText(text)
    setSnackbarColor(color ?? 'info')
    setSnackbarOpen(true)
  }
}
