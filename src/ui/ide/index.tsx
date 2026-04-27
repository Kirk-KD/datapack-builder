import {MenuBar} from "./MenuBar";
import {WorkspacePanel} from "../workspace";
import {EditorModal} from "../editor";
import {IDEProvider} from "./context/IDEProvider.tsx";

export function IDE() {
  return (
    <IDEProvider>
      <MenuBar />
      <WorkspacePanel />
      <EditorModal />
    </IDEProvider>
  )
}