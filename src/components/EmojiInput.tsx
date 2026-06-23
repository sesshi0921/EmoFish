import type { ChangeEvent } from 'react'
import { normalizeEmojiInput } from '../lib/emoji'

type EmojiInputProps = {
  value: string
  onChange: (value: string) => void
}

export function EmojiInput({ value, onChange }: EmojiInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(normalizeEmojiInput(event.target.value))
  }

  return (
    <input
      aria-label="Emoji input"
      className="emoji-input"
      type="text"
      inputMode="text"
      enterKeyHint="done"
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={handleChange}
      onFocus={(event) => event.currentTarget.select()}
      placeholder=""
    />
  )
}
