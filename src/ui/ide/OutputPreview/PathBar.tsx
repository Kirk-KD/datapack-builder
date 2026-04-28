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
import {useEffect, useRef} from "react";

type PathBarProps = {
  activePath: Path
  setActivePath: React.Dispatch<React.SetStateAction<Path>>
}

export function PathBar({ activePath, setActivePath }: PathBarProps) {
  const namespace = useProjectConfigStore.getState().projectConfig.namespace
  const {compiledOutput} = useIDEContext()

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [activePath])

  return (
    <Stack direction={'row'} sx={{
      width: '100%',
      pt: 0.5,
      pb: 0.5,
      alignItems: 'center',
      ml: 1,
      mr: 1,
      minWidth: 0,
    }}>
      <PathItem // Root
        icon={<FolderZipIcon color={'secondary'}/>}
        name={namespace}
        onClick={() => setActivePath(null)}
      />

      {activePath && (
        <Stack
          ref={scrollRef}
          direction={'row'}
          sx={{
            minWidth: 0,
            flex: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            alignItems: 'center',
            scrollbarWidth: 'thin',
            maskImage: 'linear-gradient(to right, transparent 0, black px, black calc(100% - 16px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 16px), transparent 100%)',
            pr: 2
          }}
        >
          {activePath.map((name, index) => (
            <React.Fragment key={index}>
              <ChevronRightIcon fontSize={'small'} sx={{flexShrink: 0}}/>
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
      )}
    </Stack>
  )
}
