import {MenuBar} from "./MenuBar";
import {EditorModal} from "../editor";
import {Stack} from "@mui/material";
import {Panel, SplitLayout} from "./SplitLayout";
import {WorkspacePanel} from "./WorkspacePanel";
import {OutputPreview} from "./OutputPreview";
import FolderZipIcon from '@mui/icons-material/FolderZip';
import {useIDEContext} from "./context/useIDEContext.ts";
import {useKeyboardShortcuts} from "./useKeyboardShortcuts.ts";
import {HotkeysProvider} from 'react-hotkeys-hook'
import {AlertSnackbar} from './AlertSnackbar/AlertSnackbar'

export function IDE() {
  const { outputViewerOpen, setOutputViewerOpen } = useIDEContext()
  useKeyboardShortcuts()

  return (
    <HotkeysProvider>
      <Stack sx={{ width: '100%', height: '100%', minHeight: 0 }}>
        <MenuBar />
        <SplitLayout>
          <Panel dominant minWidth={'50rem'}>
            <WorkspacePanel />
          </Panel>
          <Panel width={'40%'} minWidth={'20rem'} icon={<FolderZipIcon/>} title={'output preview'} open={outputViewerOpen} setOpen={setOutputViewerOpen}>
            <OutputPreview/>
          </Panel>
        </SplitLayout>
        <EditorModal />
      </Stack>

      <AlertSnackbar/>
    </HotkeysProvider>
  )
}

export {IDEProvider} from './context/IDEProvider.tsx'
