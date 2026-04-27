import {AppBar, Box, IconButton, Stack, Toolbar} from "@mui/material";
import {MenuButton} from "./MenuButton.tsx";
import {loadProject, saveProject} from "../../core/save";
import {ProjectNameDisplay} from "./ProjectNameDisplay.tsx";
import {useIDEContext} from "./context/useIDEContext.ts";
import HardwareIcon from '@mui/icons-material/Hardware';
import CodeIcon from '@mui/icons-material/Code';
import {ToolbarPill} from "./ToolbarPill.tsx";

export function MenuBar() {
  const {blocklyWorkspaceRef} = useIDEContext()

  return (
    <AppBar color={'secondary'} position={'relative'}>
      <Toolbar variant={'dense'}>
        <Box sx={{
          minWidth: '22rem'
        }}>
          <ProjectNameDisplay />
        </Box>

        <Stack direction={'row'}>
          <MenuButton text={'File'} items={[
            {
              text: 'Save',
              onClick: () => blocklyWorkspaceRef.current && saveProject({workspace: blocklyWorkspaceRef.current})
            },
            {
              text: 'Load',
              onClick: () => blocklyWorkspaceRef.current && loadProject({workspace: blocklyWorkspaceRef.current})
            },
            {
              text: 'New',
              onClick: () => alert('WIP') // TODO new project
            }
          ]}/>
        </Stack>

        <Stack direction={'row-reverse'} sx={{
          flex: 1,
          height: '100%'
        }}>
          <ToolbarPill>
            <IconButton><HardwareIcon color={'success'}/></IconButton>
            <IconButton><CodeIcon color={'success'}/></IconButton>
          </ToolbarPill>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}