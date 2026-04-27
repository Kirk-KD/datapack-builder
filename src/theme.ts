import {createTheme, type Theme} from "@mui/material/styles"

declare module '@mui/material/styles' {
  interface TypeBackground {
    input: string,
    menuBar: string
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
    editorRowHeight: string,
    iconButtonSize: string,
    splitLayoutPanelBorderRadius: string
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

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4C91D2'
    },
    background: {
      default: '#333130',
      paper: '#44413C',
      input: '#2D2927',
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
    editorRowHeight: '2rem',
    iconButtonSize: '2rem',
    splitLayoutPanelBorderRadius: '12px'
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
        root: ({ theme }) => ({
          borderRadius: 2,
          height: theme.shape.iconButtonSize,
          width: theme.shape.iconButtonSize
        }),
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

theme = createTheme(theme, {
  palette: {
    background: {
      menuBar: theme.lighten(theme.palette.background.paper, 0.1)
    }
  }
})

export default theme