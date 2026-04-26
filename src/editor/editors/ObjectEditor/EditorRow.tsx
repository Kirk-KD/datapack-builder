import * as React from "react"
import EnableCheckbox from "./EnableCheckbox.tsx";
import Tooltip from "../../components/Tooltip.tsx";
import {Box, Typography} from "@mui/material";
import InnerEditorContainer from "../../components/InnerEditorContainer.tsx";

type EditorRowProps = {
  label: string
  description?: string
  note?: string
  optional?: boolean
  children: React.ReactElement
  isNested?: boolean
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

/**
 * A row holding the label and input for an `ObjectEditor`.
 */
export default function EditorRow({ label, description, note, optional, children, isNested, enabled, setEnabled }: EditorRowProps) {
  return (
    <>
      {note && <Box sx={{ gridColumn: '1 / -1' }}><Typography>{note}</Typography></Box>}

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        alignSelf: isNested ? 'flex-start' : 'center',
        minHeight: theme => theme.shape.editorRowHeight,
      }}>
        <EnableCheckbox show={optional} setEnabled={setEnabled} />
        <Tooltip text={description}>
          <Typography variant="body2" sx={{
            opacity: enabled ? 1 : 0.4,
            transition: 'opacity 0.2s',
          }}>{label}</Typography>
        </Tooltip>
      </Box>
      <Box inert={!enabled} sx={{
        alignSelf: isNested ? 'flex-start' : 'center',
        minHeight: theme => theme.shape.editorRowHeight,
        opacity: enabled ? 1 : 0.4,
        transition: 'opacity 0.2s',
      }}>
        {isNested ? <InnerEditorContainer>{children}</InnerEditorContainer> : children}
      </Box>
    </>
  )
}