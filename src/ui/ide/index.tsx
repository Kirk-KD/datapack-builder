import {MenuBar} from "./MenuBar.tsx";
import {WorkspacePanel} from "../workspace";
import {EditorModal} from "../editor";
import useBlocklyWorkspace from "../workspace/useBlocklyWorkspace.ts";
import {useAutosave} from "../workspace/useAutosave.ts";
import {useState} from "react";

export function IDE() {
  const { blocklyDivRef, blocklyWorkspaceRef } = useBlocklyWorkspace()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  useAutosave(blocklyWorkspaceRef, setHasUnsavedChanges)

  return (
    <>
      <MenuBar blocklyWorkspaceRef={blocklyWorkspaceRef} hasUnsavedChanges={hasUnsavedChanges}/>
      <WorkspacePanel blocklyDivRef={blocklyDivRef} />
      <EditorModal />
    </>
  )
}