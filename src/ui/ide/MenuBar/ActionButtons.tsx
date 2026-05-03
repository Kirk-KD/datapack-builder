import HardwareIcon from '@mui/icons-material/Hardware';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import {IconsPill} from "../../components/IconsPill.tsx";
import {controller, ProjectConfigEditor} from "../../editor";
import {IconsPillDivider} from "../../components/IconsPillDivider.tsx";
import {IconButton, Tooltip} from "@mui/material";
import {useIDEContext} from "../context/useIDEContext.ts";
import {mapToOutputZip} from "../../../core/output-preview";
import {orchestrate} from '../../../core/compiler'
import {useProjectConfigStore} from '../../../stores'

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
        <IconButton onClick={() => {
          if (!blocklyWorkspaceRef.current) return

          const outputFiles = orchestrate(
            blocklyWorkspaceRef.current, useProjectConfigStore.getState().projectConfig)

          // Replace namespace with readable name later
          outputFiles.download(useProjectConfigStore.getState().projectConfig.namespace)

          setCompiledOutput(mapToOutputZip(outputFiles.toStringMap(), new Date()))
          setOutputViewerOpen(true)
        }}>
          <HardwareIcon color={'success'}/>
        </IconButton>
      </Tooltip>

      <Tooltip title={'Preview datapack'}>
        <IconButton onClick={() => {
          if (!blocklyWorkspaceRef.current) return

          const outputFiles = orchestrate(
            blocklyWorkspaceRef.current, useProjectConfigStore.getState().projectConfig)

          setCompiledOutput(mapToOutputZip(outputFiles.toStringMap(), new Date()))
          setOutputViewerOpen(true)
        }}><CodeIcon color={'success'}/></IconButton>
      </Tooltip>
    </IconsPill>
  )
}