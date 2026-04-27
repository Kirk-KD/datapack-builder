import {MenuBar} from "./MenuBar";
import {EditorModal} from "../editor";
import {IDEProvider} from "./context/IDEProvider.tsx";
import {Stack} from "@mui/material";
import {Panel, SplitLayout} from "./SplitLayout";
import {WorkspacePanel} from "./WorkspacePanel";

export function IDE() {
  return (
    <IDEProvider>
      <Stack sx={{ width: '100%', height: '100%' }}>
        <MenuBar />
        <SplitLayout>
          <Panel minWidth={'40%'} dominant>
            <WorkspacePanel />
          </Panel>
        </SplitLayout>
        <EditorModal />
      </Stack>
    </IDEProvider>
  )
}