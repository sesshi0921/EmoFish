import { supportedEmojis } from '../data/supportedEmojis'

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('en', { granularity: 'grapheme' })
    : null

export function getGraphemes(value: string) {
  if (!value) {
    return []
  }

  if (segmenter) {
    return Array.from(segmenter.segment(value), (item) => item.segment)
  }

  return Array.from(value)
}

export function normalizeEmojiInput(rawValue: string) {
  const graphemes = getGraphemes(rawValue)

  for (let index = graphemes.length - 1; index >= 0; index -= 1) {
    const candidate = graphemes[index]
    if (supportedEmojis.includes(candidate)) {
      return candidate
    }
  }

  return ''
}

export function isSupportedEmoji(value: string) {
  return supportedEmojis.includes(value)
}
