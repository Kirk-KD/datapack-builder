import {Checkbox} from "@mui/material";

type EnableCheckboxProps = {
  show?: boolean
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

export default function EnableCheckbox({ show, enabled, setEnabled }: EnableCheckboxProps) {
  return (
    <Checkbox
      size="small"
      checked={enabled}
      onChange={(_, checked) => setEnabled(checked)}
      sx={{ visibility: show ? 'visible' : 'hidden', p: 0 }}
    />
  )
}