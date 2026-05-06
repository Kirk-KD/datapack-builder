import {Box} from "@mui/material"
import {useMemo} from "react"
import {useIDEContext} from "../../context/useIDEContext.ts"
import {LineNumbers} from './LineNumbers.tsx'
import {CodeDisplay} from './CodeDisplay.tsx'
import * as React from 'react'
import type {FilePathArray} from '../../../../core/folder-repr'

type FileViewerProps = {
  activePath: FilePathArray,
  setActivePath: React.Dispatch<React.SetStateAction<FilePathArray>>
}

export function FileViewer({ activePath, setActivePath }: FileViewerProps) {
  const { compiledOutput } = useIDEContext()

  const file = activePath && compiledOutput ? compiledOutput.get(activePath.join('/')) : undefined

  // Calculate line count by counting newlines in segments
  const lineCount = useMemo(() => {
    if (!file) return 0
    let count = 1
    for (const segment of file.content) {
      count += (segment.content.match(/\n/g) || []).length
    }
    return count
  }, [file])

  if (!activePath || !compiledOutput || !file) return null

  return (
    <Box sx={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
      fontFamily: theme => theme.typography.mono,
      fontSize: theme => theme.typography.fontSize,
      lineHeight: '1.6'
    }}>
      <LineNumbers lineCount={lineCount} />
      <CodeDisplay segments={file.content} setActivePath={setActivePath}/>
    </Box>
  )
}
