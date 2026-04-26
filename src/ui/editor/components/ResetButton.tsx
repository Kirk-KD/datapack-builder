import RestartAltIcon from '@mui/icons-material/RestartAlt'
import {IconButton, Tooltip} from "@mui/material";

export default function ResetButton({ handleReset, disabled }: {
  handleReset: () => void
  disabled?: boolean
}) {
  return (
    <Tooltip title={'Reset'}>
      <IconButton onClick={handleReset} disabled={disabled} size="small">
        <RestartAltIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}