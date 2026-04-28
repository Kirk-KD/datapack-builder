import * as React from "react";
import {Box, Stack} from "@mui/material";
import {Panel} from './Panel.tsx'
import {RESIZER_SIZE_PX, type PanelElement} from "./resize.ts";
import {useSplitLayout} from "./useSplitLayout.ts";

type SplitLayoutProps = {
  children: React.ReactElement<typeof Panel> | React.ReactElement<typeof Panel>[]
}

export function SplitLayout({ children }: SplitLayoutProps) {
  const panels = React.useMemo(
    () => (React.Children.toArray(children) as PanelElement[])
      .filter((panel) => panel.props.dominant || panel.props.open),
    [children]
  )
  const panelLayoutKey = React.useMemo(
    () => panels
      .map((panel, index) => String(panel.key ?? index))
      .join('|'),
    [panels]
  )
  const {containerRef, panelRefs, sizes, startResize} = useSplitLayout({panels, panelLayoutKey})

  return (
    <Box sx={{
      flex: 1,
      backgroundColor: 'background.menuBar',
      p: 1,
      pt: 0,
    }}>
      <Box ref={containerRef} sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        alignItems: 'stretch',
        borderRadius: theme => theme.shape.splitLayoutPanelBorderRadius,
        display: 'flex',
        flexDirection: 'row',
        gap: 0
      }}>
        {panels.map((panel, index) => {
          const size = sizes?.[index]

          return (
            <React.Fragment key={panel.key ?? index}>
              <Stack
                direction={'row'}
                ref={(node: HTMLDivElement | null) => {
                  panelRefs.current[index] = node
                }}
                sx={{
                  minWidth: 0,
                  flexShrink: 0,
                  flexGrow: size === undefined ? (panel.props.dominant ? 1 : 0) : 0,
                  flexBasis: size === undefined ? panel.props.width ?? 0 : `calc(${(size * 100).toFixed(6)}% - ${RESIZER_SIZE_PX * (panels.length - 1) * size}px)`,
                }}
              >
                {panel}
              </Stack>

              {/* Resize */}
              {index < panels.length - 1 ? (
                <Box
                  onPointerDown={(event) => startResize(index, event)}
                  sx={{
                    width: `${RESIZER_SIZE_PX}px`,
                    flexShrink: 0,
                    cursor: 'col-resize',
                    position: 'relative',
                    touchAction: 'none',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 8,
                      bottom: 8,
                      left: '50%',
                      width: '1px',
                      transform: 'translateX(-50%)',
                      backgroundColor: theme => theme.lighten(theme.palette.background.default, 0.08),
                    },
                    '&:hover::before': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              ) : null}
            </React.Fragment>
          )
        })}
      </Box>
    </Box>
  )
}

export {Panel} from './Panel.tsx'
