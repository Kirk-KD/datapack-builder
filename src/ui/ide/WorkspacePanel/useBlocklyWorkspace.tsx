import {useEffect, useRef} from "react";
import * as Blockly from "blockly";
import {injectWorkspace, setupWorkspace} from "../../../core/blockly";
import {controller} from '../../editor'
import {CreateProcedure, CreateTypedValue} from '../WorkspaceDialogues'
import type {ConstantValueType, VariableValueType} from '../../../core/blockly/registry'

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
      },
      onCreateVariable: onConfirm => {
        let variableName = 'var'
        let variableType: VariableValueType = 'int'

        controller.openEditorModal({
          title: 'Create Variable',
          mode: 'confirm',
          onConfirm: () => onConfirm({ name: variableName, valueType: variableType }),
          editor: <CreateTypedValue<VariableValueType>
            typeOptions={[{ label: 'Integer', value: 'int' }]}
            onChangeName={name => { variableName = name }}
            onChangeType={type => { variableType = type }}
          />
        })
      },
      onCreateConstant: onConfirm => {
        let constantName = 'constant'
        let constantType: ConstantValueType = 'int'

        controller.openEditorModal({
          title: 'Create Constant',
          mode: 'confirm',
          onConfirm: () => onConfirm({ name: constantName, valueType: constantType }),
          editor: <CreateTypedValue<ConstantValueType>
            defaultName={'constant'}
            typeOptions={[
              { label: 'Integer', value: 'int' },
              { label: 'String', value: 'string' },
              { label: 'Position', value: 'position' },
              { label: 'Item stack', value: 'item_stack' },
              { label: 'Array', value: 'array' }
            ]}
            onChangeName={name => { constantName = name }}
            onChangeType={type => { constantType = type }}
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
