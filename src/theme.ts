import {createTheme, type Theme} from "@mui/material/styles"

declare module '@mui/material/styles' {
  interface TypeBackground {
    input: string
  }
  interface Palette {
    scroll: Palette['primary']
  }
  interface PaletteOptions {
    scroll?: PaletteOptions['primary']
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4C91D2'
    },
    background: {
      default: '#333130',
      paper: '#44413C',
      input: '#2D2927'
    },
    scroll: {
      main: '#605d54'
    }
  },
  shape: {
    borderRadius: 2
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontWeightMedium: 600,
    fontSize: 12
  },
  shadows: Array(25).fill('none') as Theme['shadows'],
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
})

export default theme