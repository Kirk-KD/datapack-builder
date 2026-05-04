import {Box, Typography} from '@mui/material'
import * as React from 'react'

export function Confirmation({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{
      width: '40rem',
      height: 'auto',
      p: 1,
    }}>
      <Typography>{children}</Typography>
    </Box>
  )
}