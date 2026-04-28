import * as React from "react";
import {Chip} from "@mui/material";

type PathItemProp = {
  icon: React.ReactElement
  name: string
  onClick: () => void
}

export function PathItem({ icon, name, onClick }: PathItemProp) {
  return (
    <Chip icon={icon} label={name} onClick={onClick} variant={'outlined'} size={'small'} />
  )
}