import HardwareIcon from '@mui/icons-material/Hardware';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import {IconsPill} from "../../components/IconsPill.tsx";
import {controller, ProjectConfigEditor} from "../../editor";
import {IconsPillDivider} from "../../components/IconsPillDivider.tsx";
import {IconButton, Tooltip} from "@mui/material";
import {useActions} from "../useActions.tsx";

export function ActionButtons() {
  const actions = useActions()

  return (
    <IconsPill>
      <Tooltip title={'Configure project'}>
        <IconButton onClick={() => {
          controller.openEditorModal({
            title: 'Project Configuration',
            editor: <ProjectConfigEditor/>
          })
        }}>
          <SettingsIcon color={'primary'} />
        </IconButton>
      </Tooltip>

      <IconsPillDivider/>

      <Tooltip title={'Build datapack'}>
        <IconButton onClick={() => actions.buildDatapack()}>
          <HardwareIcon color={'success'}/>
        </IconButton>
      </Tooltip>

      <Tooltip title={'Preview datapack'}>
        <IconButton onClick={() => actions.inspectOutput()}>
          <CodeIcon color={'success'}/>
        </IconButton>
      </Tooltip>
    </IconsPill>
  )
}