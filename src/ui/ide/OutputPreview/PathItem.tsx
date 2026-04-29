import * as React from "react";
import {Chip, Typography} from "@mui/material";

type PathItemProp = {
  icon: React.ReactElement
  name: string
  onClick: () => void
}

export function PathItem({ icon, name, onClick }: PathItemProp) {
  return (
    <Chip
      icon={icon}
      label={(
        <Typography
          noWrap
          sx={{maxWidth: '10rem'}}
          variant={'subtitle2'}
          color={'textSecondary'}
        >{name}</Typography>
      )}
      onClick={onClick}
      variant={'outlined'}
      size={'small'}
    />
  )
}