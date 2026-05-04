import type {AlertColor} from '@mui/material'
import {useSnackbarContext} from '../context/useSnackbarContext.ts'

export function useShowAlert() {
  const {setOpen, setText, setSeverity} = useSnackbarContext()

  return (text: string, color?: AlertColor) => {
    setText(text)
    setSeverity(color ?? 'info')
    setOpen(true)
  }
}
