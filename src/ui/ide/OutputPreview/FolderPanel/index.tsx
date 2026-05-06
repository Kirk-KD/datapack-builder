import type {FilePathArray, OutputItem} from '../../../../core/folder-repr'
import {getFolderContents, getItemType} from '../../../../core/folder-repr'
import * as React from 'react'
import {Box, Divider, Stack, Typography} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import CodeIcon from '@mui/icons-material/Code'
import {useIDEContext} from '../../context/useIDEContext.ts'
import {FolderItem} from './FolderItem.tsx'
import {useProjectConfigStore} from '../../../../stores'
import {CompileTime} from "./CompileTime.tsx";

type FolderPanelProps = {
  activePath: FilePathArray
  setActivePath: React.Dispatch<React.SetStateAction<FilePathArray>>
}

export function FolderPanel({activePath, setActivePath}: FolderPanelProps) {
  const {compiledOutput} = useIDEContext()
  const namespace = useProjectConfigStore.getState().projectConfig.namespace

  if (!compiledOutput) return null

  function getActiveFolderPath(): FilePathArray {
    if (!activePath) return null
    const itemType = compiledOutput ? getItemType(compiledOutput, activePath) : undefined
    const folderPath = itemType === 'file' ? activePath.slice(0, -1) : activePath
    return folderPath.length === 0 ? null : folderPath
  }

  const folderPath = getActiveFolderPath()
  const folderContents = compiledOutput ? getFolderContents(compiledOutput, folderPath) : []

  function renderFolderContents(items: OutputItem[]) {
    return [
      (folderPath && folderPath.length > 0) ? (
        <FolderItem
          key={'..'}
          icon={<FolderIcon sx={{ color: 'grey' }}/>}
          name={'..'}
          onClick={() => {
            const back = folderPath.slice(0, -1)
            setActivePath(back.length === 0 ? null : back)
          }}
        />
      ) : null,
      ...items.map(item => (
        <FolderItem
          key={item.path ? item.path.join('/') : 'root'}
          icon={item.type === 'folder' ? <FolderIcon color='primary'/> : <CodeIcon/>}
          name={item.name}
          selected={Boolean(activePath && item.path && item.path.join('/') === activePath.join('/'))}
          onClick={() => setActivePath(item.path)}
        />
      ))
    ]
  }


  return (
    <Stack sx={{
      backgroundColor: 'background.paper',
      height: '100%',
      minWidth: '10rem',
      maxWidth: '20rem'
    }}>
      <Stack sx={{p: 1, flex: 1}}>
        <Typography sx={{mb: 0.5}} noWrap>
          <b>{folderPath ? folderPath[folderPath.length - 1] : namespace}</b>
        </Typography>
        <Stack sx={{flex: 1}}>
          {renderFolderContents(folderContents)}
        </Stack>
      </Stack>

      <Divider/>

      <Box sx={{p: 1}}>
        <CompileTime/>
      </Box>
    </Stack>
  )
}
