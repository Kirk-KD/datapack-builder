import type {OutputFolder, Path} from '../../../core/output-preview'
import * as React from 'react'
import {Stack, Typography} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import CodeIcon from '@mui/icons-material/Code'
import {useIDEContext} from '../context/useIDEContext.ts'
import {FolderItem} from './FolderItem.tsx'
import {useProjectConfigStore} from '../../../stores'

type FolderPanelProps = {
  activePath: Path
  setActivePath: React.Dispatch<React.SetStateAction<Path>>
}

export function FolderPanel({activePath, setActivePath}: FolderPanelProps) {
  const {compiledOutput} = useIDEContext()
  const namespace = useProjectConfigStore.getState().projectConfig.namespace

  if (!compiledOutput) return null

  function renderFolderContents(folder: OutputFolder) {
    return [
      activePath ? (
        <FolderItem
          key={'..'}
          icon={<FolderIcon sx={{ color: 'grey' }}/>}
          name={'..'}
          onClick={() => {
            const back = activePath.slice(0, -1)
            setActivePath(back.length === 0 ? null : back)
          }}
        />
      ) : null,
      ...folder.content.map(item => (
        <FolderItem
          key={item.path!.join('/')}
          icon={item.type === 'folder' ? <FolderIcon color='primary'/> : <CodeIcon/>}
          name={item.path![item.path!.length - 1]}
          selected={Boolean(activePath && item.path!.join('/') === activePath.join('/'))}
          onClick={() => setActivePath(item.path)}
        />
      ))
    ]
  }

  function getActiveFolderPath(): Path {
    if (!activePath) return activePath
    const item = compiledOutput!.getItem(activePath)
    const folderPath = item?.type === 'file' ? activePath.slice(0, -1) : activePath
    return folderPath.length === 0 ? null : folderPath
  }

  const folderPath = getActiveFolderPath()
  const folder = compiledOutput.getItem(folderPath)

  return (
    <Stack sx={{backgroundColor: 'background.paper', height: '100%', p: 1}}>
      <Typography sx={{mb: 0.5}}>
        <b>{folderPath ? folderPath[folderPath.length - 1] : namespace}</b>
      </Typography>

      <Stack sx={{flex: 1}}>
        {folder && renderFolderContents(folder as OutputFolder)}
      </Stack>
    </Stack>
  )
}