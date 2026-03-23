import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import getToolboxContents from '../blocks'
import { mcfunctionGenerator } from '../compiler'
import { scoreboardManager } from '../compiler/scoreboardManager'

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

    workspaceRef.current.registerToolboxCategoryCallback('MC_VARIABLES', (workspace) => {
      const vars = workspace.getVariableMap().getAllVariables()
      const createButton = {
        kind: 'button',
        text: 'Create variable',
        callbackKey: 'CREATE_VARIABLE'
      }
      if (vars.length === 0) return [createButton]
      const firstName = vars[0].getName()
      return [
        createButton,
        { kind: 'block', type: 'mc_var_set', fields: { VAR: { name: firstName, type: '' } } },
        { kind: 'block', type: 'mc_var_change', fields: { VAR: { name: firstName, type: '' } } },
        { kind: 'block', type: 'mc_var_get', fields: { VAR: { name: firstName, type: '' } } },
      ]
    })

    workspaceRef.current.registerButtonCallback('CREATE_VARIABLE', () => {
      Blockly.Variables.createVariableButtonHandler(workspaceRef.current!)
    })

    return () => {
      workspaceRef.current?.dispose()
    }
  }, [])

  function handleInspect() {
    if (!workspaceRef.current) return
    scoreboardManager.reset()
    const code = mcfunctionGenerator.workspaceToCode(workspaceRef.current)
    console.log(code)
  }

  return (
    <>
      <button onClick={handleInspect}>Inspect</button>
      <div ref={divRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}

export default WorkspacePanel