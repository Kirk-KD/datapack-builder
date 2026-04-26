import * as React from "react";
import {Button, type SxProps, type Theme} from "@mui/material";
import type {MouseEventHandler} from "react";

type EditorButtonProps = {
  children?: React.ReactNode
  sx?: SxProps<Theme>
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export default function EditorButton({ children, sx, onClick }: EditorButtonProps) {
  return (
    <Button onClick={onClick} size={'small'} variant={'outlined'} sx={{
      ...sx,
      p: 0,
      height: '1.5rem',
      minWidth: '1.5rem',
      fontSize: 'fontSize'
    }}>
      {children}
    </Button>
  )
}