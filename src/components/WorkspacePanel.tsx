import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import {registerContinuousToolbox, additionalOptions, setupWorkspace} from '../workspaceSetup.ts'
import getToolboxContents from '../blocks'
import { compile } from '../compiler'
import { updateWorkspaceRegistry} from '../compiler/workspaceRegistry'

import type {WorkspaceSvg} from "blockly";

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

  // Register outside useEffect to avoid error due to variables category
  registerContinuousToolbox()

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

  function handleInspect() {
    if (!workspaceRef.current) return
    const files = compile(workspaceRef.current)
    const output = Array.from(files.entries())
      .map(([path, content]) => `=== ${path} ===\n${content}`)
      .join('\n\n')
    console.log(output)
  }

  return (
    <>
      <button onClick={handleInspect}>Inspect</button>
      <div ref={divRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}

export default WorkspacePanel