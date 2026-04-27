import {MenuBar} from "./MenuBar";
import {WorkspacePanel} from "../workspace";
import {EditorModal} from "../editor";
import {IDEProvider} from "./context/IDEProvider.tsx";
import {Stack} from "@mui/material";
import {Panel, SplitLayout} from "./SplitLayout";

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