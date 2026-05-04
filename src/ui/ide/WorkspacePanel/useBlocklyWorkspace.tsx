import {useEffect, useRef} from "react";
import * as Blockly from "blockly";
import {injectWorkspace, setupWorkspace} from "../../../core/blockly";
import {controller} from '../../editor'
import {CreateProcedure} from '../WorkspaceDialogues'
import type {VariableValueType} from '../../../core/blockly/registry'

export default function useBlocklyWorkspace() {
  const divRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    const workspaceDiv = divRef.current
    if (!workspaceDiv) return

    const workspace = injectWorkspace(workspaceDiv)
    workspaceRef.current = workspace
    const deinitWorkspace = setupWorkspace(workspace, {
      onCreateProcedure: onConfirm => {
        let procName = 'my_procedure'
        let procParams: {
          name: string
          type: VariableValueType
        }[] = []

        controller.openEditorModal({
          title: 'Create Procedure',
          mode: 'confirm',
          onConfirm: () => onConfirm({ name: procName, params: procParams }),
          editor: <CreateProcedure
            onChangeName={name => { procName = name }}
            onChangeParams={params => { procParams = params}}
          />
        })
      }
    })

    let frameId: number | null = null
    const resizeWorkspace = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }

      frameId = requestAnimationFrame(() => {
        Blockly.svgResize(workspace)
        frameId = null
      })
    }

    resizeWorkspace()

    const resizeObserver = new ResizeObserver(() => {
      resizeWorkspace()
    })

    resizeObserver.observe(workspaceDiv)
    window.addEventListener('resize', resizeWorkspace)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', resizeWorkspace)
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
      deinitWorkspace()
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  return { blocklyDivRef: divRef, blocklyWorkspaceRef: workspaceRef }
}
