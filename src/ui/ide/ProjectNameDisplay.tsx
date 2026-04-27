import {CircularProgress, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {useProjectConfigStore} from "../../stores";
import {useEffect, useState} from "react";
import {controller, ProjectConfigEditor} from "../editor";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from '@mui/icons-material/Save';
import {useIDEContext} from "./context/useIDEContext.ts";
import {ToolbarPill} from "./ToolbarPill.tsx";

export function ProjectNameDisplay() {
  const [namespace, setNamespace] = useState<string>(useProjectConfigStore.getState().projectConfig.namespace)
  const {hasUnsavedChanges} = useIDEContext()

  useEffect(() => {
    return useProjectConfigStore.subscribe(store => {
      setNamespace(store.projectConfig.namespace)
    })
  }, [])

  return (
    <Stack direction={'row'} spacing={1} sx={{
      alignItems: 'center'
    }}>
      <ToolbarPill>
        <Typography variant={'h6'} sx={{ pl: 1 }}><b>{namespace}</b></Typography>
        <Tooltip title={'Configure project'}>
          <IconButton onClick={() => {
            controller.openEditorModal({
              title: 'Project Configuration',
              editor: <ProjectConfigEditor/>
            })
          }}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </ToolbarPill>
      <Stack direction={'row'} spacing={0.5} sx={{
        alignItems: 'center',
        visibility: hasUnsavedChanges ? 'visible' : 'hidden'
      }}>
        <SaveIcon color={'primary'}/>
        <CircularProgress size={'1rem'}/>
      </Stack>
    </Stack>
  )
}