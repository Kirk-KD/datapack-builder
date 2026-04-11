import './ResetButton.css'

export default function ResetButton({ handleReset, disabled }: {
  handleReset: () => void
  disabled?: boolean
}) {
  return (
    <button onClick={handleReset} disabled={disabled} className='resetButton'>
      <img src={'/reset.svg'} alt={'reset button'} width={'20'} height={'20'} />
    </button>
  )
}