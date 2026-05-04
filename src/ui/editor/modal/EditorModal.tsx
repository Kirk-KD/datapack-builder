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

  const handleConfirm = () => {
    if (payload.mode !== 'confirm') return
    payload.onConfirm()
    controller.closeEditorModal()
  }

  return (
    <Modal open={open}>
      <Stack sx={{
        position: 'absolute',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        ...(maximized ? {
          top: 0,
          left: 0,
          transform: 'none',
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh'
        } : {
          top: theme => theme.spacing(3),
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'fit-content',
          height: 'fit-content',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'hidden'
        }),
      }}>
         <Stack direction={'row'} sx={{
           flex: '0 0 auto',
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
           {!payload.noFullscreen && <MaximizeButton maximized={maximized}/>}
         </Stack>
        <Box sx={{
          backgroundColor: 'background.paper',
          p: 1,
          width: '100%',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{
            p: 2,
            pl: 4,
            pr: 4,
            width: '100%',
            flex: '1 1 auto',
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
        <Stack direction={'row'} sx={{
          flex: '0 0 auto',
          backgroundColor: 'background.paper',
          p: 1,
          gap: 1,
          justifyContent: 'flex-end',
          borderBottomLeftRadius: theme => theme.shape.surfaceBorderRadius,
          borderBottomRightRadius: theme => theme.shape.surfaceBorderRadius
        }}>
          {payload.mode === 'confirm' ? (
            <>
              <Button onClick={controller.closeEditorModal}>Cancel</Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </>
          ) : (
            <Button onClick={controller.closeEditorModal}>Done</Button>
          )}
        </Stack>
      </Stack>
    </Modal>
  )
}
