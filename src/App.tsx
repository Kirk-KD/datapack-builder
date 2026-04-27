import {WorkspacePanel} from "./ui/workspace"
import {controller, EditorModal} from "./ui/editor"
import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import theme from "./theme.ts";
import {ProjectConfigEditor} from "./ui/editor/editors/ProjectConfigEditor.tsx";

function App() {
  controller.openEditorModal({
    title: 'Project Configuration',
    editor: <ProjectConfigEditor/>
  })
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