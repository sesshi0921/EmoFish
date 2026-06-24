import { useRef, useState } from 'react'
import { EmojiInput } from '../components/EmojiInput'
import { GyoButton } from '../components/GyoButton'
import { SceneCanvas } from '../scene/SceneCanvas'
import type { FishEntry } from '../scene/SceneCanvas'

type SwimScreenProps = {
  emoji: string
}

export function SwimScreen({ emoji }: SwimScreenProps) {
  const nextIdRef = useRef(1)
  const [nextEmoji, setNextEmoji] = useState('')
  const [fishEntries, setFishEntries] = useState<FishEntry[]>([{ id: 'fish-0', emoji }])

  const handleAddFish = () => {
    if (!nextEmoji) {
      return
    }

    const entry = { id: `fish-${nextIdRef.current}`, emoji: nextEmoji }
    nextIdRef.current += 1
    setNextEmoji('')

    setFishEntries((current) => {
      const living = current.filter((item) => !item.exiting)
      const overflow = living.length >= 5 ? living[0] : null
      const marked = overflow
        ? current.map((item) => (item.id === overflow.id ? { ...item, exiting: true } : item))
        : current

      if (overflow) {
        window.setTimeout(() => {
          setFishEntries((items) => items.filter((item) => item.id !== overflow.id))
        }, 850)
      }

      return [...marked, entry]
    })
  }

  return (
    <div className="swim-screen">
      <SceneCanvas emoji={emoji} mode="swim" fishEntries={fishEntries} />
      <form
        className="add-fish-bar"
        onSubmit={(event) => {
          event.preventDefault()
          handleAddFish()
        }}
      >
        <EmojiInput value={nextEmoji} onChange={setNextEmoji} />
        <GyoButton disabled={!nextEmoji} onClick={handleAddFish} />
      </form>
    </div>
  )
}
