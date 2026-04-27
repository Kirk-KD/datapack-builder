import {useEffect, useRef} from "react";
import * as Blockly from "blockly";
import {injectWorkspace, setupWorkspace} from "../../../core/blockly";

export default function useBlocklyWorkspace() {
  const divRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    const workspaceDiv = divRef.current
    if (!workspaceDiv) return

    const workspace = injectWorkspace(workspaceDiv)
    workspaceRef.current = workspace
    setupWorkspace(workspace)

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
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  return { blocklyDivRef: divRef, blocklyWorkspaceRef: workspaceRef }
}
