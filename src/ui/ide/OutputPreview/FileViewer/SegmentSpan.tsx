import type {Segment} from '../../../../core/compiler/mapping.ts'
import {Box} from '@mui/material'
import * as React from 'react'
import type {FilePathArray} from '../../../../core/folder-repr'
import {useActions} from '../../useActions.tsx'

type SegmentSpanProps = {
  segment: Segment
  setActivePath: React.Dispatch<React.SetStateAction<FilePathArray>>
  hoveredSegmentId: {sourceBlockId?: string; filePath?: string} | null
  setHoveredSegmentId: React.Dispatch<React.SetStateAction<{sourceBlockId?: string; filePath?: string} | null>>
}
export function SegmentSpan({ segment, setActivePath, hoveredSegmentId, setHoveredSegmentId }: SegmentSpanProps) {
  const {focusOnBlockById} = useActions()

  const isHovered = hoveredSegmentId &&
    hoveredSegmentId.sourceBlockId === segment.sourceBlockId &&
    hoveredSegmentId.filePath === segment.filePath

  return (
    <Box
      onClick={() => {
        if (segment.filePath) setActivePath(segment.filePath.split('/'))
        if (segment.sourceBlockId) focusOnBlockById(segment.sourceBlockId)
      }}
      onMouseEnter={() => {
        if (segment.filePath || segment.sourceBlockId) {
          setHoveredSegmentId({sourceBlockId: segment.sourceBlockId, filePath: segment.filePath})
        }
      }}
      onMouseLeave={() => {
        setHoveredSegmentId(null)
      }}
      sx={{
        display: 'inline',
        whiteSpace: 'pre',
        ...((segment.filePath || segment.sourceBlockId) ? {
          cursor: 'pointer',
          ...(isHovered ? {
            textDecoration: 'underline'
          } : {})
        } : {})
      }}
    >
      {segment.content}
    </Box>
  )
}
