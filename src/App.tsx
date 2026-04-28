import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import theme from "./theme.ts";
import {IDE, IDEProvider} from "./ui/ide";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{ width: '100vw', height: '100vh' }}>
        <IDEProvider>
          <IDE/>
        </IDEProvider>
      </Box>
    </ThemeProvider>
  )
}

export default App