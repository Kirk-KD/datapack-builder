import {Checkbox} from "@mui/material";

type EnableCheckboxProps = {
  show?: boolean
  setEnabled: (enabled: boolean) => void
}

export default function EnableCheckbox({ show, setEnabled }: EnableCheckboxProps) {
  return (
    <Checkbox
      size="small"
      onChange={(_, checked) => setEnabled(checked)}
      sx={{ visibility: show ? 'visible' : 'hidden', p: 0 }}
    />
  )
}