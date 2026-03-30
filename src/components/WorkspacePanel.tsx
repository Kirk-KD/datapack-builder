import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import DarkTheme from '@blockly/theme-dark'
import {blocks as procedureBlocks, unregisterProcedureBlocks} from '@blockly/block-shareable-procedures'
import getToolboxContents from '../blocks'
import { compile } from '../compiler'
import getVariablesCategory from '../blocks/categories/variables'
import { colours } from '../blocks/blockColours'
import { updateProcedures, updateVariables } from '../compiler/workspaceRegistry'

function WorkspacePanel() {
  const divRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    if (!divRef.current) return

    const customTheme = Blockly.Theme.defineTheme('customDark', {
      base: DarkTheme,
      name: 'Custom',
      blockStyles: {
        procedure_blocks: {
          colourPrimary: colours.procedures.toString(),
          colourSecondary: colours.procedures.toString(),
          colourTertiary: colours.procedures.toString()
        }
      },
      fontStyle: {
        family: "Helvetica Neue",
        weight: "500",
        size: 9,
      }
    })

    workspaceRef.current = Blockly.inject(divRef.current, {
      toolbox: {
        kind: 'categoryToolbox',
        contents: getToolboxContents()
      },
      theme: customTheme,
      renderer: 'custom_renderer'
    })

    // Default placeholder variable
    workspaceRef.current.getVariableMap().createVariable('myVar', 'mc_scoreboard_variable')

    // Custom dynamic category for variables
    workspaceRef.current.registerToolboxCategoryCallback('MC_VARIABLES', () => {
      return getVariablesCategory()
    })
    workspaceRef.current.registerButtonCallback('CREATE_VARIABLE', () => {
      Blockly.Variables.createVariableButtonHandler(workspaceRef.current!, undefined, 'mc_scoreboard_variable')
    })

    // Load built-in procedure blocks
    unregisterProcedureBlocks()
    Blockly.common.defineBlocks(procedureBlocks)
    // Remove unwanted loaded procedure blocks
    delete Blockly.Blocks['procedures_callreturn']
    delete Blockly.Blocks['procedures_defreturn']
    delete Blockly.Blocks['procedures_ifreturn']

    // Populate toolbox
    workspaceRef.current.updateToolbox({
      kind: 'categoryToolbox',
      contents: getToolboxContents(workspaceRef.current!)
    })

    workspaceRef.current.addChangeListener((event) => {
      // Update toolbox and variable list whenever variables are modified
      if (
        event.type === Blockly.Events.VAR_CREATE ||
        event.type === Blockly.Events.VAR_DELETE ||
        event.type === Blockly.Events.VAR_RENAME
      ) {
        workspaceRef.current!.updateToolbox({
          kind: 'categoryToolbox',
          contents: getToolboxContents(workspaceRef.current!)
        })
        updateVariables(workspaceRef.current!.getVariableMap().getAllVariables())
        // Also update procedures when a parameter is renamed (VAR_RENAME fires for param renames)
        updateProcedures(workspaceRef.current!.getProcedureMap().getProcedures())
      }

      // Update procedure list whenever procedures are modified
      else if (
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_CHANGE
      ) {
        workspaceRef.current!.updateToolbox({
          kind: 'categoryToolbox',
          contents: getToolboxContents(workspaceRef.current!)
        })
        updateProcedures(workspaceRef.current!.getProcedureMap().getProcedures())
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