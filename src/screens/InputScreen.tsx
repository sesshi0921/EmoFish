import { useState } from 'react'
import { EmojiInput } from '../components/EmojiInput'
import { GyoButton } from '../components/GyoButton'

type InputScreenProps = {
  onLaunch: (emoji: string) => void
}

export function InputScreen({ onLaunch }: InputScreenProps) {
  const [emoji, setEmoji] = useState('')

  return (
    <div className="input-screen">
      <h1 className="app-title">EmoFish</h1>
      <div className="input-stack">
        <EmojiInput value={emoji} onChange={setEmoji} />
        <GyoButton disabled={!emoji} onClick={() => onLaunch(emoji)} />
      </div>
    </div>
  )
}
