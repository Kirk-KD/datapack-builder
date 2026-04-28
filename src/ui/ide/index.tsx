import {MenuBar} from "./MenuBar";
import {EditorModal} from "../editor";
import {Stack} from "@mui/material";
import {Panel, SplitLayout} from "./SplitLayout";
import {WorkspacePanel} from "./WorkspacePanel";
import {OutputViewer} from "./OutputViewer";
import CodeIcon from '@mui/icons-material/Code';
import {useIDEContext} from "./context/useIDEContext.ts";
import {useKeyboardShortcuts} from "./useKeyboardShortcuts.ts";

export function IDE() {
  const { outputViewerOpen, setOutputViewerOpen } = useIDEContext()
  useKeyboardShortcuts()

  return (
    <Stack sx={{ width: '100%', height: '100%' }}>
      <MenuBar />
      <SplitLayout>
        <Panel dominant minWidth={'50rem'}>
          <WorkspacePanel />
        </Panel>
        <Panel width={'30%'} minWidth={'20rem'} icon={<CodeIcon/>} title={'output preview'} open={outputViewerOpen} setOpen={setOutputViewerOpen}>
          <OutputViewer/>
        </Panel>
      </SplitLayout>
      <EditorModal />
    </Stack>
  )
}

export {IDEProvider} from './context/IDEProvider.tsx'
