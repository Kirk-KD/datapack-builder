import {Divider, Stack} from "@mui/material";
import {useEffect, useState} from "react";
import type {Path} from "../../../core/output-preview";
import {PathBar} from "./PathBar.tsx";
import {FolderPanel} from "./FolderPanel.tsx";
import {useIDEContext} from "../context/useIDEContext.ts";
import {FileViewer} from "./FileViewer.tsx";

export function OutputPreview() {
  const {compiledOutput} = useIDEContext()
  const [activePath, setActivePath] = useState<Path>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivePath(null)
  }, [compiledOutput])

  if (compiledOutput === null) return null

  return (
    <Stack sx={{
      width: '100%',
      height: '100%',
      backgroundColor: 'background.default'
    }}>
      <Stack direction={'row'} sx={{
        flex: 1
      }}>
        <FolderPanel activePath={activePath} setActivePath={setActivePath}/>
        <FileViewer activePath={activePath}/>
      </Stack>
      <Divider/>
      <PathBar activePath={activePath} setActivePath={setActivePath}/>
    </Stack>
  )
}