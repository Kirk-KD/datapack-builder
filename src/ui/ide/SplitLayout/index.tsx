import * as React from "react";
import {Box, Stack} from "@mui/material";
import {Panel} from './Panel.tsx'

type SplitLayoutProps = {
  children: React.ReactElement<typeof Panel> | React.ReactElement<typeof Panel>[]
}

export function SplitLayout({ children }: SplitLayoutProps) {
  return (
    <Box sx={{
      flex: 1,
      backgroundColor: 'background.menuBar',
      p: 1,
      pt: 0,
    }}>
      <Stack direction={'row'} spacing={1} sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: theme => theme.shape.splitLayoutPanelBorderRadius
      }}>
        {children}
      </Stack>
    </Box>
  )
}

export {Panel} from './Panel.tsx'