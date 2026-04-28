import * as React from "react";
import {Stack, Typography} from "@mui/material";

type FolderItemProps = {
  icon: React.ReactElement
  name: string
  selected?: boolean
  onClick: () => void
}

export function FolderItem({ icon, name, selected, onClick }: FolderItemProps) {
  return (
    <Stack direction={'row'} spacing={0.5} sx={{
      width: '100%',
      p: 0.5,
      pl: 1,
      pr: 1,
      alignItems: 'center',
      cursor: 'pointer',
      border: theme => `1px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
      borderRadius: '9999px'
    }} onClick={onClick}>
      {icon}
      <Typography color={'textSecondary'} sx={{
        '&:hover': {
          color: 'white'
        },
        flex: 1
      }}>{name}</Typography>
    </Stack>
  )
}