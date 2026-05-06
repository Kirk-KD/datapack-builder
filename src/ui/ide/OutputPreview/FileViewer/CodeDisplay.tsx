import {SegmentSpan} from './SegmentSpan.tsx'
import {Box} from '@mui/material'
import type {Segment} from '../../../../core/compiler/mapping.ts'
import * as React from 'react'
import type {FilePathArray} from '../../../../core/folder-repr'

type CodeDisplayProps = {
  segments: Segment[]
  setActivePath: React.Dispatch<React.SetStateAction<FilePathArray>>
}

export function CodeDisplay({ segments, setActivePath }: CodeDisplayProps) {
  const [hoveredSegmentId, setHoveredSegmentId] = React.useState<{sourceBlockId?: string; filePath?: string} | null>(null)

  return (
    <Box sx={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: 'auto',
      p: 1,
    }}>
      {segments.map((segment, index) => {
        return (
          <SegmentSpan
            key={`segment-${index}`}
            segment={segment}
            setActivePath={setActivePath}
            hoveredSegmentId={hoveredSegmentId}
            setHoveredSegmentId={setHoveredSegmentId}
          />
        )
      })}
    </Box>
  )
}
