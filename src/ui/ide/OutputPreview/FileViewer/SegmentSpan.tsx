import type {Segment} from '../../../../core/compiler/mapping.ts'
import {Box} from '@mui/material'
import * as React from 'react'
import type {FilePathArray} from '../../../../core/folder-repr'
import {useActions} from '../../useActions.tsx'

type SegmentSpanProps = {
  segment: Segment
  setActivePath: React.Dispatch<React.SetStateAction<FilePathArray>>
}
export function SegmentSpan({ segment, setActivePath }: SegmentSpanProps) {
  const {focusOnBlockById} = useActions()

  return (
    <Box
      onClick={() => {
        if (segment.filePath) setActivePath(segment.filePath.split('/'))
        if (segment.sourceBlockId) focusOnBlockById(segment.sourceBlockId)
      }}
      sx={{
        display: 'inline',
        whiteSpace: 'pre',
        ...((segment.filePath || segment.sourceBlockId) ? {
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline'
          }
        } : {})
      }}
    >
      {segment.content}
    </Box>
  )
}
