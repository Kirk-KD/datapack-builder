import ExtensionIcon from '@mui/icons-material/Extension'
import ExtensionOffIcon from '@mui/icons-material/ExtensionOff'
import {IconButton, Menu, MenuItem, Tooltip} from '@mui/material'
import type {RegistryReferenceOption} from '../../../core/editor'
import {useState} from 'react'

type ToggleRegistryReferenceButtonProps = {
  options: RegistryReferenceOption[]
  selectedRegRef: RegistryReferenceOption | null
  setSelectedRegRef: (selectedRegRef: RegistryReferenceOption | null) => void
}

export function RegistryReferenceButton({
  options,
  selectedRegRef,
  setSelectedRegRef,
}: ToggleRegistryReferenceButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  return (
    <>
      <Tooltip title={selectedRegRef ? 'Clear reference' : 'Use reference'}>
        <IconButton
          onClick={(event) => {
            if (selectedRegRef === null) {
              setAnchorEl(event.currentTarget)
            } else setSelectedRegRef(null)
          }}
          size={'small'}
        >
          {selectedRegRef ? <ExtensionOffIcon fontSize={'small'}/> : <ExtensionIcon fontSize={'small'}/>}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
      >{
        options.map((option, index) => {
          return (
            <MenuItem key={index} onClick={() => {
              setSelectedRegRef(option)
              setAnchorEl(null)
            }}>
              {option.readableName}
            </MenuItem>
          )
        })
      }</Menu>
    </>
  )
}