import * as THREE from 'three'

function createCanvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function drawPaintStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.beginPath()
  ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function toHex(value: number) {
  return Math.round(THREE.MathUtils.clamp(value, 0, 255)).toString(16).padStart(2, '0')
}

function colorToCss(color: THREE.Color) {
  return `#${toHex(color.r * 255)}${toHex(color.g * 255)}${toHex(color.b * 255)}`
}

export function createFishBodyTexture(emoji = '') {
  const rawEmoji = emoji ? createRawEmojiCanvas(emoji) : null
  const baseColor = new THREE.Color('#f8c62f')
  const hsl = { h: 0, s: 0, l: 0 }
  baseColor.getHSL(hsl)
  const lightColor = new THREE.Color().setHSL(hsl.h, Math.max(0.28, hsl.s * 0.82), Math.min(0.82, hsl.l + 0.18))
  const shadowColor = new THREE.Color().setHSL(hsl.h, Math.min(0.92, hsl.s * 1.12), Math.max(0.28, hsl.l - 0.16))
  const warmShadowColor = new THREE.Color().setHSL((hsl.h + 0.035) % 1, Math.min(0.95, hsl.s * 1.1), Math.max(0.26, hsl.l - 0.11))
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = colorToCss(baseColor)
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawPaintStroke(ctx, 380, 164, 250, 54, `${colorToCss(lightColor)}77`, -0.12)
  drawPaintStroke(ctx, 640, 308, 280, 72, `${colorToCss(shadowColor)}45`, 0.18)
  drawPaintStroke(ctx, 516, 252, 420, 14, 'rgba(255, 250, 176, 0.34)', -0.02)
  drawPaintStroke(ctx, 280, 372, 220, 40, `${colorToCss(warmShadowColor)}40`, 0.22)

  if (rawEmoji) {
    drawFacePatch(ctx, rawEmoji, baseColor)
  }

  return createCanvasTexture(canvas)
}

function drawFacePatch(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, baseColor: THREE.Color) {
  paintifyEmoji(source)

  const centerX = 824
  const centerY = 256
  const width = 500
  const height = 494

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(centerX, centerY, width * 0.55, height * 0.54, 0, 0, Math.PI * 2)
  ctx.clip()

  ctx.filter = 'blur(18px)'
  ctx.globalAlpha = 0.36
  ctx.drawImage(source, centerX - width * 0.61, centerY - height * 0.59, width * 1.22, height * 1.18)

  ctx.filter = 'blur(5px)'
  ctx.globalAlpha = 0.48
  ctx.drawImage(source, centerX - width * 0.57, centerY - height * 0.55, width * 1.14, height * 1.1)

  ctx.filter = 'none'
  ctx.globalAlpha = 0.92
  ctx.drawImage(source, centerX - width * 0.52, centerY - height * 0.51, width * 1.04, height * 1.02)
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  const hsl = { h: 0, s: 0, l: 0 }
  baseColor.getHSL(hsl)
  const blendColor = colorToCss(new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l))
  const blend = ctx.createRadialGradient(centerX, centerY, 128, centerX, centerY, 292)
  blend.addColorStop(0, `${blendColor}00`)
  blend.addColorStop(0.66, `${blendColor}14`)
  blend.addColorStop(1, `${blendColor}8a`)
  ctx.fillStyle = blend
  ctx.fillRect(centerX - width * 0.6, centerY - height * 0.58, width * 1.2, height * 1.16)
  ctx.restore()
}

function createRawEmojiCanvas(emoji: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return canvas
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '560px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
  ctx.fillText(emoji, 384, 410)
  return canvas
}

function paintifyEmoji(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = image.data

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3]
    if (alpha < 4) {
      continue
    }

    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const lightness = 0.299 * red + 0.587 * green + 0.114 * blue
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const saturation = max === 0 ? 0 : (max - min) / max

    if (lightness > 218 && saturation < 0.24) {
      pixels[index] = 252
      pixels[index + 1] = 246
      pixels[index + 2] = 228
      continue
    }

    if (lightness < 88) {
      pixels[index] = 46
      pixels[index + 1] = 18
      pixels[index + 2] = 15
      continue
    }

    const tone = (lightness - 110) / 145
    pixels[index] = 242 + Math.round(THREE.MathUtils.clamp(tone, 0, 1) * 10)
    pixels[index + 1] = 184 + Math.round(THREE.MathUtils.clamp(tone, 0, 1) * 22)
    pixels[index + 2] = 34 + Math.round(THREE.MathUtils.clamp(tone, 0, 1) * 18)
  }

  ctx.putImageData(image, 0, 0)
}

export function createEmojiFaceTexture(emoji: string) {
  const source = createRawEmojiCanvas(emoji)
  paintifyEmoji(source)

  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.filter = 'blur(24px)'
  ctx.globalAlpha = 0.36
  ctx.drawImage(source, 16, 12, 736, 736)
  ctx.restore()

  ctx.save()
  ctx.filter = 'blur(7px)'
  ctx.globalAlpha = 0.38
  ctx.drawImage(source, 44, 40, 680, 680)
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.88
  ctx.drawImage(source, 82, 76, 604, 604)
  ctx.restore()

  ctx.globalCompositeOperation = 'destination-in'
  const mask = ctx.createRadialGradient(384, 386, 126, 384, 386, 356)
  mask.addColorStop(0, 'rgba(0, 0, 0, 1)')
  mask.addColorStop(0.56, 'rgba(0, 0, 0, 0.92)')
  mask.addColorStop(0.82, 'rgba(0, 0, 0, 0.34)')
  mask.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = mask
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'

  ctx.save()
  ctx.globalCompositeOperation = 'destination-over'
  const blend = ctx.createRadialGradient(384, 386, 80, 384, 386, 360)
  blend.addColorStop(0, 'rgba(246, 194, 42, 0.18)')
  blend.addColorStop(0.72, 'rgba(246, 194, 42, 0.12)')
  blend.addColorStop(1, 'rgba(246, 194, 42, 0)')
  ctx.fillStyle = blend
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()

  return createCanvasTexture(canvas)
}

export function createFinTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 384
  canvas.height = 384
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#df9b19'
  ctx.beginPath()
  ctx.moveTo(316, 190)
  ctx.lineTo(72, 58)
  ctx.lineTo(132, 190)
  ctx.lineTo(72, 326)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 219, 92, 0.22)'
  ctx.beginPath()
  ctx.moveTo(258, 188)
  ctx.lineTo(112, 106)
  ctx.lineTo(152, 190)
  ctx.lineTo(112, 276)
  ctx.closePath()
  ctx.fill()

  return createCanvasTexture(canvas)
}
