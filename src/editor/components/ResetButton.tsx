import {IconButton} from "@mui/material";

export default function ResetButton({ handleReset, disabled }: {
  handleReset: () => void
  disabled?: boolean
}) {
  return (
    <IconButton onClick={handleReset} disabled={disabled} size={'small'}>
      <img src={'/reset.svg'} alt={'reset button'} width={'20'} height={'20'} />
    </IconButton>
  )
}