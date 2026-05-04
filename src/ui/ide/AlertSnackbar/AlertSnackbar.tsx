import {Alert, Snackbar, type SnackbarCloseReason} from '@mui/material'
import {type SyntheticEvent} from 'react'
import {useIDEContext} from '../context/useIDEContext.ts'

export function AlertSnackbar() {
  const {snackbarOpen, setSnackbarOpen, snackbarText, snackbarColor} = useIDEContext()

  const handleClose = (
    _event: Event | SyntheticEvent<unknown, Event>, reason: SnackbarCloseReason
  ) => {
    if (reason !== 'clickaway') setSnackbarOpen(false)
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      open={snackbarOpen}
      onClose={handleClose}
      autoHideDuration={3000}
    >
      <Alert
        onClose={() => setSnackbarOpen(false)}
        sx={{ width: '100%' }}
        variant={'filled'}
        color={snackbarColor}
      >
        {snackbarText}
      </Alert>
    </Snackbar>
  )
}
