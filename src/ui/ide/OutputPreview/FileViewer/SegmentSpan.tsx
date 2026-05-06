import type {Segment} from '../../../../core/compiler/mapping.ts'
import {Box} from '@mui/material'

type SegmentSpanProps = {
  segment: Segment
  index: number
}
export function SegmentSpan({ segment, index }: SegmentSpanProps) {
  return (
    <Box
      onClick={() => console.log(segment.getSourceBlockId(), segment.getFunctionId())}
      key={index}
      sx={{
        display: 'inline',
        whiteSpace: 'pre',
        fontFamily: theme => theme.typography.mono
      }}
    >
      {segment.content}
    </Box>
  )
}
