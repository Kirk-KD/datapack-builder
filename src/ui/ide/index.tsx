import {MenuBar} from "./MenuBar";
import {EditorModal} from "../editor";
import {IDEProvider} from "./context/IDEProvider.tsx";
import {Stack} from "@mui/material";
import {Panel, SplitLayout} from "./SplitLayout";
import {WorkspacePanel} from "./WorkspacePanel";
import {OutputViewer} from "./OutputViewer";
import CodeIcon from '@mui/icons-material/Code';

export function IDE() {
  return (
    <IDEProvider>
      <Stack sx={{ width: '100%', height: '100%' }}>
        <MenuBar />
        <SplitLayout>
          <Panel dominant minWidth={'50rem'}>
            <WorkspacePanel />
          </Panel>
          <Panel width={'30%'} minWidth={'20rem'} icon={<CodeIcon/>} title={'output preview'}>
            <OutputViewer/>
          </Panel>
        </SplitLayout>
        <EditorModal />
      </Stack>
    </IDEProvider>
  )
}