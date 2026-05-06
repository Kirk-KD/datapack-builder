import type {Segment} from '../../../../core/compiler/mapping.ts'
import {Box} from '@mui/material'

type SegmentSpanProps = {
  segment: Segment
}
export function SegmentSpan({ segment }: SegmentSpanProps) {
  return (
    <Box
      onClick={() => console.log(segment.sourceBlockId, segment.filePath)}
      sx={{
        display: 'inline',
        whiteSpace: 'pre',
      }}
    >
      {segment.content}
    </Box>
  )
}
