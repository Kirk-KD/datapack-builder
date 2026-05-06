import {SegmentSpan} from './SegmentSpan.tsx'
import {Box} from '@mui/material'
import type {Segment} from '../../../../core/compiler/mapping.ts'

type CodeDisplayProps = {
  segments: Segment[]
}

export function CodeDisplay({ segments }: CodeDisplayProps) {
  return (
    <Box sx={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: 'auto',
      p: 1,
    }}>
      {segments.map((segment, index) => {
        const key = segment.getSourceBlockId() ? `${segment.getSourceBlockId()}-${segment.getFunctionId()}-${index}` : `segment-${index}`
        return <SegmentSpan key={key} segment={segment}/>
      })}
    </Box>
  )
}
