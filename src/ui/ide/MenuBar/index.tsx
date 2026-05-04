import {AppBar, Box, Stack, Toolbar} from "@mui/material";
import {MenuButton} from "./MenuButton.tsx";
import {loadProject, newProject, saveProject} from "../../../core/save";
import {ProjectNameDisplay} from "./ProjectNameDisplay.tsx";
import {useIDEContext} from "../context/useIDEContext.ts";
import {ActionButtons} from "./ActionButtons.tsx";
import {controller} from '../../editor'
import {Confirmation} from '../WorkspaceDialogues'

export function MenuBar() {
  const {blocklyWorkspaceRef, setHasUnsavedFileChanges} = useIDEContext()

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
              onClick: () => {
                if (!blocklyWorkspaceRef.current) return
                saveProject({workspace: blocklyWorkspaceRef.current})
                setHasUnsavedFileChanges(false)
              }
            },
            {
              text: 'Open',
              onClick: () => {
                controller.openEditorModal({
                  title: 'Unsaved changes',
                  editor: (
                    <Confirmation>
                      Unsaved changes will be lost when another project is opened. Proceed?<br/>
                      Save changes to your computer with <b>File {'>'} Save</b>.
                    </Confirmation>
                  ),
                  mode: 'confirm',
                  onConfirm: () => {
                    if (!blocklyWorkspaceRef.current) return
                    loadProject({workspace: blocklyWorkspaceRef.current})
                    setHasUnsavedFileChanges(false)
                  }
                })
              }
            },
            {
              text: 'New',
              onClick: () => {
                controller.openEditorModal({
                  title: 'Unsaved changes',
                  editor: (
                    <Confirmation>
                      Unsaved changes will be lost when a new project is created. Proceed?<br/>
                      Save changes to your computer with <b>File {'>'} Save</b>.
                    </Confirmation>
                  ),
                  mode: 'confirm',
                  onConfirm: () => {
                    if (!blocklyWorkspaceRef.current) return
                    newProject(blocklyWorkspaceRef.current)
                    setHasUnsavedFileChanges(true) // A new project is not yet saved to computer.
                  }
                })
              }
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