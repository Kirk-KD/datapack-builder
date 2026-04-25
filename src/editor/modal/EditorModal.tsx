import {controller, useEditorModal} from "./controller.ts";
import {Box, Button, Modal, Stack, Typography} from "@mui/material";

function MaximizeButton({ maximized }: { maximized: boolean }) {
  return (
    <Button onClick={() => controller.setMaximized(!maximized)}>
      <img
        src={maximized ? '/minimize.svg' : '/maximize.svg'}
        alt={maximized ? 'minimize button' : 'maximize button'}
        width="20"
        height="20"
      />
    </Button>
  )
}

function EditorModal() {
  const { open, maximized, payload } = useEditorModal()

  if (!open || !payload) return null

  return (
    <Modal open={open}>
      <Stack sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -25rem)',
        width: maximized ? '100%' : '50rem',
        maxHeight: maximized ? '100%' : '50rem',
      }}>
        <Stack direction={'row'} sx={{
          backgroundColor: 'background.paper',
          alignItems: 'center'
        }}>
          <Typography variant={'h5'} sx={{
            flex: 1,
            p: 1
          }}>{payload.title}</Typography>
          <MaximizeButton maximized={maximized}/>
        </Stack>
        <Box sx={{
          backgroundColor: 'background.default',
          p: 2,
          width: '100%',
          overflowX: 'auto'
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