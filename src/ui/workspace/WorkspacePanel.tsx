import './WorkspacePanel.css'
import {Box} from "@mui/material"
import {useIDEContext} from "../ide/context/useIDEContext.ts";

function WorkspacePanel() {
  const {blocklyDivRef} = useIDEContext()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <Box ref={blocklyDivRef} sx={{ flex: 1 }} />
    </Box>
  )
}

export default WorkspacePanel
