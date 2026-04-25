import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx"
import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import theme from "./theme.ts";
import {useTestItemStack} from "./editor/testEditors.ts";

function App() {
  useTestItemStack()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{ width: '100vw', height: '100vh' }}>
        <WorkspacePanel />
        <EditorModal />
      </Box>
    </ThemeProvider>
  )
}

export default App