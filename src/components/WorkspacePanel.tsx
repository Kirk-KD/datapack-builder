import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import getToolboxContents from '../blocks'
import { compile } from '../compiler'
import getVariablesCategory from '../blocks/categories/variables'

function WorkspacePanel() {
  const divRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    if (!divRef.current) return

    workspaceRef.current = Blockly.inject(divRef.current, {
      toolbox: {
        kind: 'categoryToolbox',
        contents: getToolboxContents()
      }
    })

    // Default placeholder variable
    workspaceRef.current.getVariableMap().createVariable('myVar')

    // Custom dynamic category for variables
    workspaceRef.current.registerToolboxCategoryCallback('MC_VARIABLES', (workspace) => {
      return getVariablesCategory(workspace as Blockly.WorkspaceSvg)
    })
    workspaceRef.current.registerButtonCallback('CREATE_VARIABLE', () => {
      Blockly.Variables.createVariableButtonHandler(workspaceRef.current!)
    })

    // Populate toolbox
    workspaceRef.current.updateToolbox({
      kind: 'categoryToolbox',
      contents: getToolboxContents(workspaceRef.current)
    })

    // Update toolbox whenever variables are modified
    workspaceRef.current.addChangeListener((event) => {
      if (
        event.type === Blockly.Events.VAR_CREATE ||
        event.type === Blockly.Events.VAR_DELETE ||
        event.type === Blockly.Events.VAR_RENAME
      ) {
        workspaceRef.current!.updateToolbox({
          kind: 'categoryToolbox',
          contents: getToolboxContents(workspaceRef.current!)
        })
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