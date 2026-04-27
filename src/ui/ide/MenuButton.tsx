import {Button, Menu, MenuItem} from "@mui/material";
import * as React from "react";
import {useState} from "react";

type MenuItemDef = {
  text: string
  onClick: () => void
}

export function MenuButton({ text, items }: { text: string, items: MenuItemDef[] }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Button onClick={handleClick} size={'large'} sx={{
        color: 'white'
      }}>{text}</Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {items.map(({ text, onClick }) => (
          <MenuItem onClick={() => {
            onClick()
            handleClose()
          }}>{text}</MenuItem>
        ))}
      </Menu>
    </>
  )
}