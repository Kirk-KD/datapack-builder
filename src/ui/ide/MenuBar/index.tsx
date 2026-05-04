import {AppBar, Box, Stack, Toolbar} from "@mui/material";
import {MenuButton} from "./MenuButton.tsx";
import {ProjectNameDisplay} from "./ProjectNameDisplay.tsx";
import {useIDEContext} from "../context/useIDEContext.ts";
import {ActionButtons} from "./ActionButtons.tsx";
import {actions} from '../actions.ts'

export function MenuBar() {
  const ideContext = useIDEContext()

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
          <img src={'/favicon.svg'} width={52} alt={'logo'}/>
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
              onClick: () => actions.saveProject(ideContext)
            },
            {
              text: 'Open',
              onClick: () => actions.openProject(ideContext)
            },
            {
              text: 'New',
              onClick: () => actions.newProject(ideContext)
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