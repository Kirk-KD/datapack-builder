import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import JSZip from 'jszip'
import {registerContinuousToolbox, additionalOptions, setupWorkspace} from '../../core/blockly/workspaceSetup.ts'
import getToolboxContents from '../../core/blockly'
import { compile } from '../../core/compiler'
import { updateWorkspaceRegistry} from '../../core/compiler/workspaceRegistry'
import './WorkspacePanel.css'

import type {WorkspaceSvg} from "blockly";
import {useProjectConfigStore} from "../../stores/projectConfig.ts";
import {Box, Button, Checkbox, FormControlLabel, Stack} from "@mui/material"

// Register outside useEffect to avoid error due to variables category
registerContinuousToolbox()

function updateToolbox(workspace: WorkspaceSvg) {
  updateWorkspaceRegistry(workspace)
  workspace.updateToolbox({
    kind: 'categoryToolbox',
    contents: getToolboxContents(workspace)
  })
}

function WorkspacePanel() {
  const divRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  const projectConfig = useProjectConfigStore((state) => state.projectConfig)
  const updateConfig = useProjectConfigStore((state) => state.updateConfig)

  useEffect(() => {
    if (!divRef.current) return

    workspaceRef.current = Blockly.inject(divRef.current, {
      toolbox: {
        kind: 'categoryToolbox',
        contents: getToolboxContents()
      },
      ...additionalOptions
    })
    setupWorkspace(workspaceRef.current!)

    // Initial placeholder variable
    workspaceRef.current.getVariableMap().createVariable('myVar', 'mc_scoreboard_variable')
    updateToolbox(workspaceRef.current)

    workspaceRef.current.registerButtonCallback('CREATE_VARIABLE', () => {
      Blockly.Variables.createVariableButtonHandler(workspaceRef.current!, undefined, 'mc_scoreboard_variable')
    })

    workspaceRef.current.addChangeListener((event) => {
      if (
        // Update toolbox and variable list whenever variables are modified
        event.type === Blockly.Events.VAR_CREATE ||
        event.type === Blockly.Events.VAR_DELETE ||
        event.type === Blockly.Events.VAR_RENAME ||
        // Update procedure list whenever procedures are modified
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_CHANGE
      ) {
        updateToolbox(workspaceRef.current!)
      }
    })

    return () => {
      workspaceRef.current?.dispose()
    }
  }, [])

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
