import {Box, Stack} from "@mui/material"

type LineNumbersProps = {
  lineCount: number
}

export function LineNumbers({ lineCount }: LineNumbersProps) {
  return (
    <Stack sx={{
      backgroundColor: 'background.default',
      borderRight: '1px solid',
      borderColor: theme => theme.palette.divider,
      pr: 2,
      pl: 1,
      py: 1,
      overflow: 'hidden',
      minWidth: 'fit-content',
      userSelect: 'none',
      color: theme => theme.palette.text.secondary,
    }}>
      {Array.from({ length: lineCount }, (_, i) => (
        <Box key={i + 1}>
          {i + 1}
        </Box>
      ))}
    </Stack>
  )
}

