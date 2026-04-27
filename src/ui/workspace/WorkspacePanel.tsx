import './WorkspacePanel.css'
import JSZip from 'jszip'
import { compile } from '../../core/compiler'
import {Box, Button, Stack} from "@mui/material"
import useBlocklyWorkspace from "./useBlocklyWorkspace.ts";
import {useAutosave} from "./useAutosave.ts";
import {loadProject, saveProject} from "../../core/save";
import {controller} from "../editor";
import {ProjectConfigEditor} from "../editor";

function WorkspacePanel() {
  const { divRef, workspaceRef } = useBlocklyWorkspace()
  useAutosave(workspaceRef)

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Temporary debug top bar */}
      <Stack direction="row" spacing={1} sx={{ p: 1, backgroundColor: 'background.default' }}>
        <Button variant="outlined" size="small" onClick={handleInspect}>Inspect</Button>
        <Button variant="outlined" size="small" onClick={handleDownload}>Download</Button>
        <Button variant="outlined" size="small" onClick={() =>
          workspaceRef.current && saveProject({ workspace: workspaceRef.current })}>Save</Button>
        <Button variant="outlined" size="small" onClick={() =>
          workspaceRef.current && loadProject({ workspace: workspaceRef.current })}>Open</Button>
        <Button variant="outlined" size="small" onClick={() =>
          controller.openEditorModal({
            title: 'Project Configuration',
            editor: <ProjectConfigEditor/>
          })
        }>Project Config</Button>
        <Button variant="outlined" size="small" onClick={() => localStorage.clear()}>Clear LS</Button>
      </Stack>
      <Box ref={divRef} sx={{ flex: 1 }} />
    </Box>
  )
}

export default WorkspacePanel
