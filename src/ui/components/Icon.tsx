import * as React from "react";
import {Box, type SxProps} from "@mui/material";

export function Icon({ children, sx }: { children: React.ReactNode, sx?: SxProps }) {
  return (
    <Box sx={{
      width: theme => theme.shape.iconButtonSize,
      height: theme => theme.shape.iconButtonSize,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx
    }}>{children}</Box>
  )
}