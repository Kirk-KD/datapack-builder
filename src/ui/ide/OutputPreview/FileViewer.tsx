import { useEffect, useRef } from "react"
import {EditorView, lineNumbers} from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import type {Path} from "../../../core/output-preview"
import {Box, useTheme} from "@mui/material"
import {useIDEContext} from "../context/useIDEContext.ts"

type FileViewerProps = {
  activePath: Path
}

export function FileViewer({ activePath }: FileViewerProps) {
  const theme = useTheme()

  const { compiledOutput } = useIDEContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  const file = activePath && compiledOutput ? compiledOutput.getItem(activePath) : undefined
  const contents = file && file.type === 'file' ? file.content as string : undefined

  useEffect(() => {
    if (!containerRef.current || contents === undefined) return

    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: contents
        }
      })
      return
    }

    viewRef.current = new EditorView({
      state: EditorState.create({
        doc: contents,
        extensions: [
          EditorView.editable.of(false),
          EditorView.lineWrapping,
          lineNumbers(),
          EditorView.theme({
            '.cm-lineNumbers .cm-gutterElement': {
              color: 'grey',
              paddingRight: '1rem',
              minWidth: '2rem',
            },
            '.cm-gutter': {
              backgroundColor: theme.palette.background.default,
              border: 'none'
            },
            '.cm-gutters': {
              border: 'none'
            },
            '.cm-content': {
              fontFamily: theme.typography.mono,
              fontSize: theme.typography.fontSize,
            },
                '.cm-editor': {
                  height: '100%',
                  maxHeight: '100%',
                  minHeight: 0,
                },
                // CodeMirror's internal scroller should handle overflowing content
                '.cm-scroller': {
                  height: '100%',
                  overflow: 'auto',
                  minHeight: 0,
                }
          })
        ]
      }),
      parent: containerRef.current
    })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [contents, theme.palette.background.default, theme.typography.fontSize, theme.typography.mono])

  if (!activePath || !compiledOutput || contents === undefined) return null

  return (
    <Box ref={containerRef} sx={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
      display: 'flex',
    }}/>
  )
}