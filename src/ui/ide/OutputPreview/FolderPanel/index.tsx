import type {FilePathArray, OutputItem} from '../../../../core/folder-repr'
import {getFolderContents, getItemType} from '../../../../core/folder-repr'
import * as React from 'react'
import {Box, Divider, IconButton, Stack, Typography} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import CodeIcon from '@mui/icons-material/Code'
import {useIDEContext} from '../../context/useIDEContext.ts'
import {FolderItem} from './FolderItem.tsx'
import {useProjectConfigStore} from '../../../../stores'
import {CompileTime} from "./CompileTime.tsx";
import {IconsPill} from '../../../components/IconsPill.tsx'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import {IconsPillDivider} from '../../../components/IconsPillDivider.tsx'

type FolderPanelProps = {
  activePath: FilePathArray
  setActivePath: React.Dispatch<React.SetStateAction<FilePathArray>>
}

export function FolderPanel({activePath, setActivePath}: FolderPanelProps) {
  const {compiledOutput} = useIDEContext()
  const namespace = useProjectConfigStore.getState().projectConfig.namespace

  // Track navigation history
  const [pathHistory, setPathHistory] = React.useState<FilePathArray[]>([null])
  const [historyIndex, setHistoryIndex] = React.useState(0)

  // Update history when activePath changes from external sources
  React.useEffect(() => {
    // Check if the new path already exists in future history (forward scenario)
    const pathStr = activePath ? activePath.join('/') : 'null'
    const existingIndex = pathHistory.findIndex(p => (p ? p.join('/') : 'null') === pathStr)

    if (existingIndex !== -1 && existingIndex !== historyIndex) {
      // Path exists in history, move to that position
      setHistoryIndex(existingIndex)
    } else if (existingIndex === -1) {
      // New path, truncate future history and add new entry
      const newHistory = pathHistory.slice(0, historyIndex + 1)
      newHistory.push(activePath)
      setPathHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [activePath, historyIndex, pathHistory])

  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < pathHistory.length - 1

  function handleBack() {
    if (canGoBack) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setActivePath(pathHistory[newIndex])
    }
  }

  function handleForward() {
    if (canGoForward) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setActivePath(pathHistory[newIndex])
    }
  }

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
      minWidth: '15rem',
      maxWidth: '20rem'
    }}>
      <Stack sx={{p: 1, flex: 1, minHeight: 0}}>
        <Stack direction={'row'} spacing={1} sx={{
          alignItems: 'center',
          mb: 0.5,
        }}>
          <IconsPill sx={{
            flex: 1,
            minWidth: 0
          }}>
            <Typography noWrap>
              <b>{folderPath ? folderPath[folderPath.length - 1] : namespace}</b>
            </Typography>
          </IconsPill>

          <IconsPill>
            <IconButton 
              size={'small'} 
              onClick={handleBack}
              disabled={!canGoBack}
            >
              <ArrowBackIosIcon fontSize={'small'} color={canGoBack ? 'inherit' : 'disabled'}/>
            </IconButton>
            <IconsPillDivider/>
            <IconButton 
              size={'small'} 
              onClick={handleForward}
              disabled={!canGoForward}
            >
              <ArrowForwardIosIcon fontSize={'small'} color={canGoForward ? 'inherit' : 'disabled'}/>
            </IconButton>
          </IconsPill>
        </Stack>
        <Stack sx={{flex: 1, minHeight: 0, overflowY: 'auto'}}>
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
