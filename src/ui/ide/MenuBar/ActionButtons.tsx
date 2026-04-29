import HardwareIcon from '@mui/icons-material/Hardware';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import {IconsPill} from "../../components/IconsPill.tsx";
import {controller, ProjectConfigEditor} from "../../editor";
import {IconsPillDivider} from "../../components/IconsPillDivider.tsx";
import {IconButton, Tooltip} from "@mui/material";
import {useIDEContext} from "../context/useIDEContext.ts";
import {compile, emit} from "../../../core/compiler";
import {mapToOutputZip} from "../../../core/output-preview";

export function ActionButtons() {
  const {blocklyWorkspaceRef, setOutputViewerOpen, setCompiledOutput} = useIDEContext()

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
        <IconButton onClick={() => blocklyWorkspaceRef.current && emit(blocklyWorkspaceRef.current)}>
          <HardwareIcon color={'success'}/>
        </IconButton>
      </Tooltip>

      <Tooltip title={'Preview datapack'}>
        <IconButton onClick={() => {
          if (!blocklyWorkspaceRef.current) return
          setCompiledOutput(mapToOutputZip(compile(blocklyWorkspaceRef.current), new Date()))
          setOutputViewerOpen(true)
        }}><CodeIcon color={'success'}/></IconButton>
      </Tooltip>
    </IconsPill>
  )
}