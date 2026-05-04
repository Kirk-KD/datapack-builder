import type {AlertColor} from '@mui/material'
import type {IDEContextValue} from '../context/IDEContext.tsx'

export function showAlert(
  { text, color }: { text: string, color?: AlertColor },
  { setSnackbarOpen, setSnackbarText, setSnackbarColor }: IDEContextValue
) {
  setSnackbarText(text)
  setSnackbarColor(color ?? 'info')
  setSnackbarOpen(true)
}
