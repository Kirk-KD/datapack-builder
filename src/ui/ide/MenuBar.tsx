import {AppBar, Stack, Toolbar} from "@mui/material";
import {MenuButton} from "./MenuButton.tsx";
import {loadProject, saveProject} from "../../core/save";
import {ProjectNameDisplay} from "./ProjectNameDisplay.tsx";
import {useIDEContext} from "./context/useIDEContext.ts";

export function MenuBar() {
  const {blocklyWorkspaceRef} = useIDEContext()

  return (
    <AppBar color={'secondary'} position={'relative'}>
      <Toolbar variant={'dense'}>
        <ProjectNameDisplay />

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
      </Toolbar>
    </AppBar>
  )
}