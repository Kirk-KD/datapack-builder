import {controller, useEditorModal} from "./controller.ts";
import {Box, Button, IconButton, Modal, Stack, Typography} from "@mui/material";

function MaximizeButton({ maximized }: { maximized: boolean }) {
  return (
    <IconButton onClick={() => controller.setMaximized(!maximized)}>
      <img
        src={maximized ? '/minimize.svg' : '/maximize.svg'}
        alt={maximized ? 'minimize button' : 'maximize button'}
        width="20"
        height="20"
      />
    </IconButton>
  )
}

function EditorModal() {
  const { open, maximized, payload } = useEditorModal()

  if (!open || !payload) return null

  return (
    <Modal open={open}>
      <Stack sx={{
        position: 'absolute',
        ...(maximized ? {
          width: '100%',
          height: '100%'
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -25rem)',
          width: '50rem',
          maxHeight: '50rem',
        })
      }}>
        <Stack direction={'row'} sx={{
          backgroundColor: 'background.paper',
          alignItems: 'center',
          p: 1,
          pl: 2,
        }}>
          <Typography variant={'h5'} sx={{
            flex: 1,
          }}>{payload.title}</Typography>
          <MaximizeButton maximized={maximized}/>
        </Stack>
        <Box sx={{
          backgroundColor: 'background.default',
          p: 2,
          width: '100%',
          overflowX: 'auto',
          flex: maximized ? 1 : undefined
        }}>
          <Box sx={{
            width: 'fit-content',
            minWidth: 'min-content',
            mx: 'auto'
          }}>
            {payload.editor}
          </Box>
        </Box>
        <Stack direction={'row-reverse'} sx={{
          backgroundColor: 'background.paper'
        }}>
          <Button onClick={controller.closeEditorModal}>Done</Button>
        </Stack>
      </Stack>
    </Modal>
  )
}

export default EditorModal