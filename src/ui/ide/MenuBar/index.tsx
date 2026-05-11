import {AppBar, Box, Button, Stack, Toolbar} from "@mui/material";
import {MenuButton} from "./MenuButton.tsx";
import {ProjectNameDisplay} from "./ProjectNameDisplay.tsx";
import {ActionButtons} from "./ActionButtons.tsx";
import {useActions} from "../useActions.tsx";
import {getItemRegistry, getItemSpritePath} from '../../../core/minecraft'

export function MenuBar() {
  const actions = useActions()

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
              onClick: () => actions.saveProject()
            },
            {
              text: 'Open',
              onClick: () => actions.openProject()
            },
            {
              text: 'New',
              onClick: () => actions.newProject()
            }
          ]}/>
          {/* TODO DEBUG BUTTON, REMOVE LATER */}
          <Button onClick={() => {
            getItemRegistry().then(async reg => {
              const ids = reg.getAll()
              const results = await Promise.all(
                ids.map(async id => ({
                  id,
                  exists: await fetch(getItemSpritePath(id), { method: 'HEAD' }).then(r => r.ok)
                }))
              )
              const missing = results.filter(r => !r.exists).map(r => r.id)
              console.log('Missing:', missing)
              console.log(`${missing.length} / ${ids.length} missing`)
            })
          }}>DEBUG</Button>
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