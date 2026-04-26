import * as React from "react";
import {Box} from "@mui/material";

type InnerEditorContainerProps = {
  children: React.ReactNode
}

export default function InnerEditorContainer({ children }: InnerEditorContainerProps) {
  return (
    <Box sx={{
      backgroundColor: 'background.input',
      p: 0.8,
      borderRadius: theme => `${theme.shape.borderRadius}px`,
      border: '1px solid',
      borderColor: 'inputBorder',
      width: 'fit-content',
    }}>
      <Box sx={{
        p: 1,
        backgroundColor: 'background.default',
        width: 'fit-content',
        borderRadius: '8px',
      }}>
        {children}
      </Box>
    </Box>
  )
}