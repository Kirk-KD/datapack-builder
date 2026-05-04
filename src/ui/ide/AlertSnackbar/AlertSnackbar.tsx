import {Alert, Snackbar, type SnackbarCloseReason} from '@mui/material'
import {type SyntheticEvent} from 'react'
import {useSnackbarContext} from '../context/useSnackbarContext.ts'

export function AlertSnackbar() {
  const {open, setOpen, text, severity} = useSnackbarContext()

  const handleClose = (
    _event: Event | SyntheticEvent<unknown, Event>, reason: SnackbarCloseReason
  ) => {
    if (reason !== 'clickaway') setOpen(false)
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      open={open}
      onClose={handleClose}
      autoHideDuration={3000}
    >
      <Alert
        onClose={() => setOpen(false)}
        sx={{ width: '100%' }}
        variant={'filled'}
        severity={severity}
      >
        {text}
      </Alert>
    </Snackbar>
  )
}
