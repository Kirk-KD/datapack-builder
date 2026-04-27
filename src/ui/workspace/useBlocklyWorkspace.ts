import {useEffect, useRef} from "react";
import * as Blockly from "blockly";
import {injectWorkspace, setupWorkspace} from "../../core/blockly";

export default function useBlocklyWorkspace() {
  const divRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    if (!divRef.current) return

    workspaceRef.current = injectWorkspace(divRef.current)
    setupWorkspace(workspaceRef.current)

    return () => workspaceRef.current?.dispose()
  }, [])

  return { blocklyDivRef: divRef, blocklyWorkspaceRef: workspaceRef }
}