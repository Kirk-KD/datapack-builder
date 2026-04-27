import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import theme from "./theme.ts";
import {IDE} from "./ui/ide";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{ width: '100vw', height: '100vh' }}>
        <IDE/>
      </Box>
    </ThemeProvider>
  )
}

export default App