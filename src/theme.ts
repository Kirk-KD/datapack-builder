import {createTheme, type Theme} from "@mui/material/styles"

declare module '@mui/material/styles' {
  interface TypeBackground {
    input: string
  }
  interface Palette {
    scroll: Palette['primary'],
    inputBorder: string
  }
  interface PaletteOptions {
    scroll?: PaletteOptions['primary'],
    inputBorder?: string
  }

  interface Shape {
    editorInputMinWidth: string,
    editorInputMaxWidth: string,
    editorMultilineStringInputMinWidth: string,
    editorMultilineStringInputMaxWidth: string,
    editorRowHeight: string
  }
  interface ThemeOptions {
    shape?: Partial<Shape>
  }

  interface TypographyVariants {
    mono: string
  }
  interface TypographyVariantsOptions {
    mono?: string
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
    },
    inputBorder: 'rgba(255, 255, 255, 0.23)',
  },
  shape: {
    borderRadius: 2,
    editorInputMinWidth: '10rem',
    editorInputMaxWidth: '20rem',
    editorMultilineStringInputMinWidth: '20rem',
    editorMultilineStringInputMaxWidth: '30rem',
    editorRowHeight: '2rem'
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontWeightMedium: 600,
    fontSize: 12,
    mono: '"JetBrains Mono", monospace'
  },
  shadows: Array(25).fill('none') as Theme['shadows'],
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          height: 'fit-content',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.input,
        }),
      },
    },
  },
})

export default theme