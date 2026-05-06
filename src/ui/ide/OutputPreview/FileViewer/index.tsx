import {Box} from "@mui/material"
import {useIDEContext} from "../../context/useIDEContext.ts"
import {SegmentSpan} from './SegmentSpan.tsx'

type FileViewerProps = {
  activePath: string[] | null
}

export function FileViewer({ activePath }: FileViewerProps) {
  const { compiledOutput } = useIDEContext()

  const file = activePath && compiledOutput ? compiledOutput.get(activePath.join('/')) : undefined

  if (!activePath || !compiledOutput || !file) return null

  return (
    <Box sx={{
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
    }}>
      {/*TODO proper display*/}
      {file.content.map((segment, index) => <SegmentSpan segment={segment} index={index}/>)}
    </Box>
  )
}
