import * as React from "react"
import EnableCheckbox from "./EnableCheckbox.tsx";
import {Box, Tooltip, Typography} from "@mui/material";
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
      {note && (<Box sx={{
        gridColumn: '1 / -1',
        backgroundColor: 'background.paper',
        width: 'fit-content',
        maxWidth: '100%',
        p: 1,
        mt: 1,
        borderRadius: theme => theme.shape.borderRadius
      }}>
        <Typography color={'textSecondary'}>{note}</Typography>
      </Box>)}

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        alignSelf: isNested ? 'flex-start' : 'center',
        minHeight: theme => theme.shape.editorRowHeight,
      }}>
        <EnableCheckbox show={optional} enabled={enabled} setEnabled={setEnabled} />
        <Tooltip describeChild title={description} placement={'top-start'}>
          <Typography variant="body2" sx={{
            opacity: enabled ? 1 : 0.4,
            transition: 'opacity 0.2s',
            fontFamily: theme => theme.typography.mono
          }}>{label}</Typography>
        </Tooltip>
      </Box>
      <Box
        onDoubleClick={() => { if (!enabled) setEnabled(true) }}
        sx={{
          cursor: enabled ? undefined : 'pointer'
        }}
      >
        <Box
          inert={!enabled}
          sx={{
            alignSelf: isNested ? 'flex-start' : 'center',
            minHeight: theme => theme.shape.editorRowHeight,
            opacity: enabled ? 1 : 0.4,
            transition: 'opacity 0.2s',
          }}
        >
          {isNested ? <InnerEditorContainer>{children}</InnerEditorContainer> : children}
        </Box>
      </Box>
    </>
  )
}