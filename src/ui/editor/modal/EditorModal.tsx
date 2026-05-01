import {controller, useEditorModal} from "./controller.ts";
import {Box, Button, IconButton, Modal, Stack, Typography} from "@mui/material";
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'

function MaximizeButton({ maximized }: { maximized: boolean }) {
  return (
    <IconButton onClick={() => controller.setMaximized(!maximized)}>
      {maximized ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
    </IconButton>
  )
}

export function EditorModal() {
  const { open, maximized, payload } = useEditorModal()

  if (!open || !payload) return null

  return (
    <Modal open={open}>
      <Stack sx={{
        position: 'absolute',
        outline: 'none',
        ...(maximized ? {
          width: '100%',
          height: '100%'
        } : {
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -45%)',
          width: '50rem',
          maxHeight: '90%',
          height: '90%'
        }),
      }}>
        <Stack direction={'row'} sx={{
          backgroundColor: 'background.paper',
          alignItems: 'center',
          p: 1,
          pl: 2,
          borderTopLeftRadius: theme => theme.shape.surfaceBorderRadius,
          borderTopRightRadius: theme => theme.shape.surfaceBorderRadius
        }}>
          <Typography variant={'h6'} sx={{
            flex: 1,
          }}>{payload.title}</Typography>
          <MaximizeButton maximized={maximized}/>
        </Stack>
        <Box sx={{
          backgroundColor: 'background.paper',
          p: 1,
          width: '100%',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}>
          <Box sx={{
            p: 1,
            width: '100%',
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            overflow: 'auto',
            backgroundColor: 'background.default',
            borderRadius: theme => theme.shape.surfaceBorderRadius,
          }}>
            <Box sx={{
              width: 'fit-content',
              minWidth: 'min-content',
              mx: 'auto',
            }}>
              {payload.editor}
            </Box>
          </Box>
        </Box>
        <Stack direction={'row-reverse'} sx={{
          backgroundColor: 'background.paper',
          p: 1,
          borderBottomLeftRadius: theme => theme.shape.surfaceBorderRadius,
          borderBottomRightRadius: theme => theme.shape.surfaceBorderRadius
        }}>
          <Button onClick={controller.closeEditorModal}>Done</Button>
        </Stack>
      </Stack>
    </Modal>
  )
}