import {CircularProgress, Stack, Typography} from "@mui/material";
import {useProjectConfigStore} from "../../../stores";
import {useEffect, useState} from "react";
import SaveIcon from '@mui/icons-material/Save';
import {useIDEContext} from "../context/useIDEContext.ts";
import {IconsPill} from "../../components/IconsPill.tsx";
import {Icon} from "../../components/Icon.tsx";

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
      <IconsPill>
        <Typography variant={'h6'} sx={{ pl: 1 }}><b>{namespace}</b></Typography>
        <Icon>
          {hasUnsavedChanges ?
            <CircularProgress size={'1rem'} sx={{
              color: 'grey',
            }}/> :
            <SaveIcon sx={{
              color: 'grey'
            }}/>
          }
        </Icon>
      </IconsPill>
    </Stack>
  )
}