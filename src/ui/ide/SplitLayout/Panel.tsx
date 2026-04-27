import * as React from "react";
import {Box, Divider, Stack, Typography} from "@mui/material";

type PanelProps = {
  children: React.ReactNode
  minWidth?: string
  dominant?: boolean
  title?: string
}

export function Panel({ children, minWidth, dominant, title }: PanelProps) {
  return (
    <Stack sx={{
      flex: dominant ? 1 : 0,
      minWidth: minWidth,
      borderRadius: theme => theme.shape.splitLayoutPanelBorderRadius
    }}>
      {title && (
        <>
          <Box sx={{
            width: '100%',
            p: theme => theme.shape.splitLayoutPanelBorderRadius,
            pt: theme => theme.shape.splitLayoutPanelBorderRadius,
            pl: theme => theme.shape.splitLayoutPanelBorderRadius,
            backgroundColor: 'background.default'
          }}>
            <Typography>{title}</Typography>
          </Box>
          <Divider sx={{
            backgroundColor: theme => theme.lighten(theme.palette.background.default, 0.01)
          }}/>
        </>
      )}
      {children}
    </Stack>
  )
}