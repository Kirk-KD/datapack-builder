import {CircularProgress, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {useProjectConfigStore} from "../../stores";
import {useEffect, useState} from "react";
import {controller, ProjectConfigEditor} from "../editor";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from '@mui/icons-material/Save';

export function ProjectNameDisplay({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) {
  const [namespace, setNamespace] = useState<string>(useProjectConfigStore.getState().projectConfig.namespace)

  useEffect(() => {
    return useProjectConfigStore.subscribe(store => {
      setNamespace(store.projectConfig.namespace)
    })
  }, [])

  return (
    <Stack direction={'row'} spacing={0} sx={{
      mr: 6,
      alignItems: 'center'
    }}>
      <Typography variant={'h5'}><b>{namespace}</b></Typography>
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
      <Stack direction={'row'} spacing={0.5} sx={{
        alignItems: 'center',
        visibility: hasUnsavedChanges ? 'visible' : 'hidden'
      }}>
        {/*<Typography color={'primary'}>Autosaving</Typography>*/}
        <SaveIcon color={'primary'}/>
        <CircularProgress size={'1rem'}/>
      </Stack>
    </Stack>
  )
}