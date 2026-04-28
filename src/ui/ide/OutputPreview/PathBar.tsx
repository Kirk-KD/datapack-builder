import type {Path} from "../../../core/output-preview";
import * as React from "react";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import FolderIcon from '@mui/icons-material/Folder';
import CodeIcon from '@mui/icons-material/Code';
import {Stack} from "@mui/material";
import {useProjectConfigStore} from "../../../stores";
import {PathItem} from "./PathItem.tsx";
import {useIDEContext} from "../context/useIDEContext.ts";

type PathBarProps = {
  activePath: Path
  setActivePath: React.Dispatch<React.SetStateAction<Path>>
}

export function PathBar({ activePath, setActivePath }: PathBarProps) {
  const namespace = useProjectConfigStore.getState().projectConfig.namespace
  const {compiledOutput} = useIDEContext()

  return (
    <Stack direction={'row'} sx={{
      width: '100%',
      p: 0.5,
      alignItems: 'center'
    }}>
      <PathItem
        icon={<FolderZipIcon color={'secondary'}/>}
        name={namespace}
        onClick={() => setActivePath(null)}
      />
      {activePath && activePath.map((name, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon fontSize={'small'}/>
          {index === activePath.length - 1 && compiledOutput?.getItem(activePath)?.type === 'file' ? (
            <PathItem
              icon={<CodeIcon/>}
              name={name}
              onClick={() => {}}
            />
          ) : (
            <PathItem
              icon={<FolderIcon color={'primary'}/>}
              name={name}
              onClick={() => setActivePath(activePath.slice(0, index + 1))}
            />
          )}
        </React.Fragment>
      ))}
    </Stack>
  )
}