type GyoButtonProps = {
  disabled?: boolean
  onClick: () => void
}

export function GyoButton({ disabled = false, onClick }: GyoButtonProps) {
  return (
    <button className="gyo-button" type="button" disabled={disabled} onClick={onClick}>
      Gyo!
    </button>
  )
}
