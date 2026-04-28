import {AppBar, Box, Stack, Toolbar} from "@mui/material";
import {MenuButton} from "./MenuButton.tsx";
import {loadProject, saveProject} from "../../../core/save";
import {ProjectNameDisplay} from "./ProjectNameDisplay.tsx";
import {useIDEContext} from "../context/useIDEContext.ts";
import {ActionButtons} from "./ActionButtons.tsx";

export function MenuBar() {
  const {blocklyWorkspaceRef} = useIDEContext()

  return (
    <AppBar position={'relative'}>
      <Toolbar variant={'dense'} sx={{
        backgroundColor: 'background.menuBar',
      }}>
        <Box sx={{
          display: 'flex',
          alignContent: 'center',
          p: 0.5
        }}>
          <img src={'/logo.svg'} width={52} alt={'logo'}/>
        </Box>

        <Box sx={{
          minWidth: '12rem',
          ml: 1,
          mr: 2
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
          height: '100%',
          alignItems: 'center'
        }}>
          <ActionButtons />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}