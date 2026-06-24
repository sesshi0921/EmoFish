import * as THREE from 'three'

function createCanvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function drawPaintBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.beginPath()
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function drawFishSilhouette(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.moveTo(102, 316)
  ctx.lineTo(28, 246)
  ctx.lineTo(78, 318)
  ctx.lineTo(26, 390)
  ctx.lineTo(106, 342)
  ctx.bezierCurveTo(134, 426, 234, 500, 410, 524)
  ctx.bezierCurveTo(662, 560, 902, 456, 950, 316)
  ctx.bezierCurveTo(898, 170, 648, 90, 416, 114)
  ctx.bezierCurveTo(240, 132, 132, 206, 102, 316)
  ctx.closePath()
}

function createEmojiCanvas(emoji: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 640

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return canvas
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '420px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
  ctx.fillText(emoji, 320, 338)

  return canvas
}

function createPaintedEmojiCanvas(emoji: string) {
  const canvas = createEmojiCanvas(emoji)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return canvas
  }

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = image.data

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3]
    if (alpha < 8) {
      continue
    }

    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const lightness = 0.299 * red + 0.587 * green + 0.114 * blue
    const maxChannel = Math.max(red, green, blue)
    const minChannel = Math.min(red, green, blue)
    const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel

    if (lightness > 210) {
      pixels[index] = 249
      pixels[index + 1] = 244
      pixels[index + 2] = 232
      continue
    }

    if (lightness < 78) {
      pixels[index] = 50
      pixels[index + 1] = 18
      pixels[index + 2] = 16
      continue
    }

    if (saturation < 0.12 && lightness > 140) {
      pixels[index] = 240
      pixels[index + 1] = 214
      pixels[index + 2] = 116
      continue
    }

    const tone = lightness / 255
    pixels[index] = 238 + Math.round(tone * 18)
    pixels[index + 1] = 176 + Math.round(tone * 34)
    pixels[index + 2] = 28 + Math.round(tone * 20)
  }

  ctx.putImageData(image, 0, 0)
  return canvas
}

function drawReferenceWideEyeFace(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.fillStyle = 'rgba(255, 248, 232, 0.98)'
  ctx.beginPath()
  ctx.ellipse(630, 286, 82, 86, -0.12, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(732, 304, 42, 54, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#241110'
  ctx.beginPath()
  ctx.ellipse(620, 294, 32, 36, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(726, 310, 17, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#3a1310'
  ctx.beginPath()
  ctx.roundRect(650, 390, 68, 26, 13)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 246, 236, 0.88)'
  ctx.fillRect(664, 398, 32, 6)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(247, 230, 170, 0.92)'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(550, 258)
  ctx.quadraticCurveTo(610, 224, 680, 240)
  ctx.stroke()
  ctx.restore()
}

function drawPaintedFace(ctx: CanvasRenderingContext2D, emoji: string) {
  if (emoji === '🫪') {
    drawReferenceWideEyeFace(ctx)
    return
  }

  const emojiCanvas = createPaintedEmojiCanvas(emoji)

  ctx.save()
  ctx.globalAlpha = 0.24
  ctx.filter = 'blur(18px)'
  ctx.drawImage(emojiCanvas, 220, 164, 320, 320)
  ctx.drawImage(emojiCanvas, 392, 144, 344, 344)
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.34
  ctx.filter = 'blur(8px)'
  ctx.drawImage(emojiCanvas, 346, 164, 294, 294)
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.84
  ctx.drawImage(emojiCanvas, 410, 154, 276, 276)
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.42
  ctx.drawImage(emojiCanvas, 64, 0, 176, 640, 238, 150, 230, 320)
  ctx.drawImage(emojiCanvas, 468, 0, 88, 640, 654, 166, 126, 262)
  ctx.restore()
}

function drawPaintedBody(ctx: CanvasRenderingContext2D, emoji: string) {
  ctx.save()
  drawFishSilhouette(ctx)
  ctx.clip()

  ctx.fillStyle = '#f6c52d'
  ctx.fillRect(0, 0, 1024, 640)

  drawPaintBlob(ctx, 564, 234, 252, 92, 'rgba(255, 230, 126, 0.22)', -0.14)
  drawPaintBlob(ctx, 690, 364, 238, 106, 'rgba(235, 165, 20, 0.22)', 0.18)
  drawPaintBlob(ctx, 360, 406, 178, 96, 'rgba(243, 187, 38, 0.18)', -0.24)

  drawPaintedFace(ctx, emoji)

  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.filter = 'blur(10px)'
  ctx.fillStyle = '#f9eb9d'
  ctx.fillRect(280, 264, 436, 16)
  ctx.fillRect(380, 412, 246, 12)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(229, 154, 18, 0.72)'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(724, 224)
  ctx.quadraticCurveTo(790, 204, 842, 236)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(614, 436)
  ctx.quadraticCurveTo(686, 414, 742, 442)
  ctx.stroke()
  ctx.restore()

  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#dc9a17'
  ctx.beginPath()
  ctx.moveTo(618, 126)
  ctx.lineTo(668, 82)
  ctx.lineTo(710, 140)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(564, 470)
  ctx.lineTo(616, 438)
  ctx.lineTo(628, 494)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(886, 288)
  ctx.lineTo(934, 310)
  ctx.lineTo(884, 344)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function createFishSpriteTexture(emoji: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 640

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawPaintedBody(ctx, emoji)

  return createCanvasTexture(canvas)
}
