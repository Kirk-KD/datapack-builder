import * as React from "react";
import {Box} from "@mui/material";
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
      <Box sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        alignItems: 'stretch',
        borderRadius: theme => theme.shape.splitLayoutPanelBorderRadius,
        display: 'flex',
        flexDirection: 'row',
        gap: 1
      }}>
        {children}
      </Box>
    </Box>
  )
}

export {Panel} from './Panel.tsx'