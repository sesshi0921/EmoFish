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

function drawBodySilhouette(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.moveTo(182, 364)
  ctx.bezierCurveTo(176, 256, 286, 170, 454, 176)
  ctx.bezierCurveTo(628, 184, 774, 262, 814, 348)
  ctx.bezierCurveTo(844, 416, 792, 512, 668, 578)
  ctx.bezierCurveTo(548, 642, 372, 648, 248, 582)
  ctx.bezierCurveTo(192, 552, 164, 508, 160, 448)
  ctx.bezierCurveTo(140, 430, 122, 404, 120, 378)
  ctx.bezierCurveTo(126, 360, 148, 354, 182, 364)
  ctx.closePath()
}

function drawPaintedBody(ctx: CanvasRenderingContext2D) {
  ctx.save()
  drawBodySilhouette(ctx)
  ctx.fillStyle = '#f8c531'
  ctx.fill()

  ctx.globalAlpha = 0.22
  drawPaintBlob(ctx, 484, 274, 148, 88, '#ffd76a', -0.14)
  drawPaintBlob(ctx, 602, 462, 128, 96, '#eeb11a', 0.28)
  drawPaintBlob(ctx, 372, 444, 134, 104, '#ffd24c', -0.36)

  ctx.globalAlpha = 0.18
  drawPaintBlob(ctx, 446, 358, 228, 14, '#fff0a6', 0.22)
  drawPaintBlob(ctx, 528, 404, 188, 18, '#eba617', -0.18)
  drawPaintBlob(ctx, 418, 532, 92, 22, '#e39d14', 0.26)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(236, 164, 20, 0.9)'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(486, 252)
  ctx.quadraticCurveTo(570, 226, 650, 268)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(534, 520)
  ctx.quadraticCurveTo(606, 500, 664, 540)
  ctx.stroke()
  ctx.restore()
}

export function createFishSpriteTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawPaintedBody(ctx)

  ctx.save()
  ctx.fillStyle = '#e1a022'
  ctx.beginPath()
  ctx.moveTo(666, 250)
  ctx.lineTo(708, 192)
  ctx.lineTo(740, 260)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(536, 530)
  ctx.lineTo(586, 490)
  ctx.lineTo(598, 548)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  return createCanvasTexture(canvas)
}

export function createEmojiFaceTexture(emoji: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '400px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
  ctx.fillText(emoji, 256, 270)

  return createCanvasTexture(canvas)
}

export function createTailTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 320

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#efb21f'
  ctx.beginPath()
  ctx.moveTo(250, 158)
  ctx.lineTo(56, 42)
  ctx.lineTo(106, 160)
  ctx.lineTo(54, 278)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 214, 98, 0.26)'
  ctx.beginPath()
  ctx.moveTo(208, 156)
  ctx.lineTo(94, 82)
  ctx.lineTo(124, 158)
  ctx.lineTo(94, 238)
  ctx.closePath()
  ctx.fill()

  return createCanvasTexture(canvas)
}
