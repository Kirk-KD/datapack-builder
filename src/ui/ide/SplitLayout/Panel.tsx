import * as React from "react";
import {Box, Divider, Stack, Typography, Icon, IconButton} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export type PanelProps =
  | {
  children: React.ReactNode,
  width?: string
  minWidth?: string
  dominant: true
  icon?: never
  title?: never
  open?: never
  setOpen?: never
}
  | {
  children: React.ReactNode
  width?: string
  minWidth?: string
  dominant?: false
  icon?: React.ReactElement<typeof Icon>
  title: string
  open: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export function Panel({ children, width, minWidth, dominant, icon, title, setOpen }: PanelProps) {
  return (
    <Box sx={{
      width: width,
      minWidth: minWidth,
      borderRadius: theme => theme.shape.splitLayoutPanelBorderRadius,
      overflow: 'hidden',
      height: '100%',
      minHeight: 0,
      flex: 1
    }}>
      {dominant ? children : (
        <Stack sx={{
          height: '100%',
          width: '100%'
        }}>
          <Stack direction={'row'} spacing={1} sx={{
            width: '100%',
            p: theme => theme.shape.splitLayoutPanelBorderRadius,
            pt: theme => theme.shape.splitLayoutPanelBorderRadius,
            pl: theme => theme.shape.splitLayoutPanelBorderRadius,
            backgroundColor: 'background.default',
            alignItems: 'center'
          }}>
            {icon}
            <Typography sx={{ flex: 1 }}>{title}</Typography>
            <IconButton onClick={() => setOpen!(false)}>
              <CloseIcon fontSize={'small'} sx={{ color: 'grey' }}/>
            </IconButton>
          </Stack>
          <Divider sx={{
            backgroundColor: theme => theme.lighten(theme.palette.background.default, 0.01)
          }}/>
           <Box sx={{
             backgroundColor: 'background.default',
             flex: 1,
             minHeight: 0,
             minWidth: 0,
           }}>
            {children}
          </Box>
        </Stack>
      )}
    </Box>
  )
}
