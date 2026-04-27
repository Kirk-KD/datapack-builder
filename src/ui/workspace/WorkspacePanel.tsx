import './WorkspacePanel.css'
import {Box} from "@mui/material"
import * as React from "react";

function WorkspacePanel({ blocklyDivRef }: { blocklyDivRef: React.RefObject<HTMLDivElement | null> }) {
  // // Debug
  // function handleInspect() {
  //   if (!workspaceRef.current) return
  //   const files = compile(workspaceRef.current)
  //   const output = Array.from(files.entries())
  //     .map(([path, content]) => `=== ${path} ===\n${content}`)
  //     .join('\n\n')
  //   console.log(output)
  // }
  //
  // // Debug
  // function handleDownload() {
  //   if (!workspaceRef.current) return
  //   const files = compile(workspaceRef.current)
  //
  //   const zip = new JSZip()
  //   for (const [path, content] of files.entries()) {
  //     zip.file(path, content)
  //   }
  //
  //   zip.generateAsync({ type: 'blob' }).then((blob) => {
  //     const link = document.createElement('a')
  //     const url = URL.createObjectURL(blob)
  //     link.href = url
  //     link.download = 'project.zip'
  //     document.body.appendChild(link)
  //     link.click()
  //     document.body.removeChild(link)
  //     URL.revokeObjectURL(url)
  //   })
  // }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Temporary debug top bar */}
      {/*<Stack direction="row" spacing={1} sx={{ p: 1, backgroundColor: 'background.default' }}>*/}
      {/*  <Button variant="outlined" size="small" onClick={handleInspect}>Inspect</Button>*/}
      {/*  <Button variant="outlined" size="small" onClick={handleDownload}>Download</Button>*/}
      {/*  <Button variant="outlined" size="small" onClick={() =>*/}
      {/*    workspaceRef.current && saveProject({ workspace: workspaceRef.current })}>Save</Button>*/}
      {/*  <Button variant="outlined" size="small" onClick={() =>*/}
      {/*    workspaceRef.current && loadProject({ workspace: workspaceRef.current })}>Open</Button>*/}

      {/*  <Button variant="outlined" size="small" onClick={() => localStorage.clear()}>Clear LS</Button>*/}
      {/*</Stack>*/}
      <Box ref={blocklyDivRef} sx={{ flex: 1 }} />
    </Box>
  )
}

export default WorkspacePanel
