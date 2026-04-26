import './WorkspacePanel.css'
import JSZip from 'jszip'
import { compile } from '../../core/compiler'
import {useProjectConfigStore} from "../../stores";
import {Box, Button, Checkbox, FormControlLabel, Stack} from "@mui/material"
import useBlocklyWorkspace from "./useBlocklyWorkspace.ts";


function WorkspacePanel() {
  const { divRef, workspaceRef } = useBlocklyWorkspace()
  const projectConfig = useProjectConfigStore((state) => state.projectConfig)
  const updateConfig = useProjectConfigStore((state) => state.updateConfig)

  // Debug
  function handleInspect() {
    if (!workspaceRef.current) return
    const files = compile(workspaceRef.current)
    const output = Array.from(files.entries())
      .map(([path, content]) => `=== ${path} ===\n${content}`)
      .join('\n\n')
    console.log(output)
  }

  // Debug
  function handleDownload() {
    if (!workspaceRef.current) return
    const files = compile(workspaceRef.current)

    const zip = new JSZip()
    for (const [path, content] of files.entries()) {
      zip.file(path, content)
    }

    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = 'project.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }

  // Debug
  function toggleNoNameMangling() {
    updateConfig({ noNameMangling: !projectConfig.noNameMangling })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Temporary debug top bar */}
      <Stack direction="row" spacing={1} sx={{ p: 1, backgroundColor: 'background.default' }}>
        <Button variant="outlined" size="small" onClick={handleInspect}>Inspect</Button>
        <Button variant="outlined" size="small" onClick={handleDownload}>Download</Button>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={projectConfig.noNameMangling}
              onChange={toggleNoNameMangling}
            />
          }
          label="No name mangling"
        />
      </Stack>
      <Box ref={divRef} sx={{ flex: 1 }} />
    </Box>
  )
}

export default WorkspacePanel
