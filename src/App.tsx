import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx"
import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import theme from "./theme.ts";

function App() {
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