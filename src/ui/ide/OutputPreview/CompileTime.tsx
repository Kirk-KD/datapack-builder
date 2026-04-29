import {useIDEContext} from "../context/useIDEContext.ts";
import {Typography} from "@mui/material";
import HardwareIcon from "@mui/icons-material/Hardware";
import {useEffect, useState} from "react";

export function CompileTime() {
  const {compiledOutput} = useIDEContext()
  const [text, setText] = useState('')

  useEffect(() => {
    if (!compiledOutput) return

    function update() {
      const timestamp = compiledOutput!.timestamp
      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()

      const minutes = Math.floor(diffMs / 60000)
      const hours = Math.floor(diffMs / 3600000)
      const days = Math.floor(diffMs / 86400000)

      let duration: string
      if (minutes < 1) duration = 'just now'
      else if (minutes < 60) duration = `${minutes}m ago`
      else if (hours < 24) duration = `${hours}h ago`
      else duration = `${days}d ago`

      setText(duration)
    }

    update()

    const interval = setInterval(update, 60000)

    return () => clearInterval(interval)
  }, [compiledOutput])

  return (
    <Typography color={'textSecondary'} sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 0.5,
      width: '100%'
    }}>
      <HardwareIcon/>{text}
    </Typography>
  )
}