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
      borderRadius: theme => theme.shape.borderRadius,
      border: '1px solid', // Should this have a border?
      borderColor: 'inputBorder',
      width: 'fit-content',
    }}>
      <Box sx={{
        p: 1,
        backgroundColor: 'background.default',
        width: 'fit-content',
        borderRadius: theme => theme.shape.borderRadius,
      }}>
        {children}
      </Box>
    </Box>
  )
}