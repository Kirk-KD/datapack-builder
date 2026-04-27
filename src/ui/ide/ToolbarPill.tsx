import * as React from "react";
import {Stack, type SxProps} from "@mui/material";

export function ToolbarPill({ children, sx }: { children: React.ReactNode, sx?: SxProps }) {
  return (
    <Stack direction={'row'} sx={{
      pl: 2,
      pr: 2,
      borderRadius: '9999px',
      backgroundColor: 'background.default',
      alignItems: 'center',
      height: theme => theme.shape.iconButtonSize,
      ...sx
    }}>{children}</Stack>
  )
}