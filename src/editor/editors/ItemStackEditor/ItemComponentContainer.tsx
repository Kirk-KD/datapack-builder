import * as React from "react";
import {Box, Stack, Typography} from "@mui/material";
import EditorButton from "../../components/EditorButton.tsx";

type ItemComponentContainerProp = {
  name: string
  editor: React.ReactElement | null
  removeComponent: (key: string) => void
}

export default function ItemComponentContainer({ name, editor, removeComponent }: ItemComponentContainerProp) {
  return (
    <Stack direction={'row'}>
      <Stack sx={{
        flex: 1
      }}>
        <Typography sx={{
          height: '2rem',
          alignContent: 'center'
        }}>
          {editor === null ? <b>!</b> : ''} {name}
        </Typography>
        <Box>
          {editor}
        </Box>
      </Stack>
      <Box><EditorButton onClick={() => removeComponent(name)}>-</EditorButton></Box>
    </Stack>
  )
}