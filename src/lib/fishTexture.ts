import * as THREE from 'three'

type ExpressionPreset = {
  eyeScale: number
  eyeTilt: number
  eyeSpread: number
  mouthWidth: number
  mouthOpen: number
  mouthTilt: number
  browLift: number
}

const presets: Record<string, ExpressionPreset> = {
  '😀': { eyeScale: 1, eyeTilt: 0, eyeSpread: 1, mouthWidth: 1.1, mouthOpen: 1.1, mouthTilt: 0, browLift: 0 },
  '🥹': { eyeScale: 1.08, eyeTilt: -0.08, eyeSpread: 0.96, mouthWidth: 0.62, mouthOpen: 0.5, mouthTilt: -0.08, browLift: 0.16 },
  '🙃': { eyeScale: 1, eyeTilt: 0.28, eyeSpread: 1.03, mouthWidth: 0.88, mouthOpen: 0.48, mouthTilt: 0.2, browLift: -0.12 },
  '😌': { eyeScale: 0.84, eyeTilt: -0.18, eyeSpread: 0.92, mouthWidth: 0.76, mouthOpen: 0.18, mouthTilt: -0.12, browLift: 0.08 },
  '😳': { eyeScale: 1.16, eyeTilt: 0, eyeSpread: 1.05, mouthWidth: 0.42, mouthOpen: 0.6, mouthTilt: 0, browLift: 0.12 },
  '😮': { eyeScale: 1.05, eyeTilt: 0, eyeSpread: 0.98, mouthWidth: 0.36, mouthOpen: 0.92, mouthTilt: 0, browLift: 0.06 },
  '🥺': { eyeScale: 1.18, eyeTilt: -0.12, eyeSpread: 0.92, mouthWidth: 0.52, mouthOpen: 0.28, mouthTilt: -0.08, browLift: 0.2 },
  '🫠': { eyeScale: 0.98, eyeTilt: 0.14, eyeSpread: 0.92, mouthWidth: 0.68, mouthOpen: 0.3, mouthTilt: 0.18, browLift: -0.22 },
  '😶': { eyeScale: 0.96, eyeTilt: 0, eyeSpread: 0.98, mouthWidth: 0.46, mouthOpen: 0.08, mouthTilt: 0, browLift: 0 },
  '😵': { eyeScale: 1.02, eyeTilt: 0.3, eyeSpread: 1.04, mouthWidth: 0.46, mouthOpen: 0.38, mouthTilt: 0.1, browLift: 0.02 },
}

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

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pupilX: number,
  pupilY: number,
  tilt: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)
  ctx.fillStyle = '#fcfbf4'
  ctx.beginPath()
  ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2e1a16'
  ctx.beginPath()
  ctx.ellipse(pupilX, pupilY, width * 0.34, height * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawClosedEye(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, tilt: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)
  ctx.strokeStyle = '#2b1b17'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-length * 0.5, 0)
  ctx.quadraticCurveTo(0, 12, length * 0.5, -4)
  ctx.stroke()
  ctx.restore()
}

function drawMouth(ctx: CanvasRenderingContext2D, preset: ExpressionPreset) {
  ctx.save()
  ctx.translate(484, 470)
  ctx.rotate(preset.mouthTilt)
  ctx.fillStyle = '#2e1715'
  ctx.beginPath()
  ctx.roundRect(-60 * preset.mouthWidth, -14, 120 * preset.mouthWidth, 28 + 20 * preset.mouthOpen, 12)
  ctx.fill()
  if (preset.mouthOpen > 0.65) {
    ctx.fillStyle = '#fff8de'
    ctx.fillRect(-42 * preset.mouthWidth, -2, 84 * preset.mouthWidth, 10)
  }
  ctx.restore()
}

function drawExpression(ctx: CanvasRenderingContext2D, emoji: string) {
  const preset = presets[emoji] ?? presets['😀']
  const eyeSpread = 132 * preset.eyeSpread
  const frontEyeX = 396
  const rearEyeX = frontEyeX - eyeSpread
  const eyeY = 354 - preset.browLift * 24

  if (emoji === '😌') {
    drawClosedEye(ctx, rearEyeX, eyeY, 68, -0.2)
    drawClosedEye(ctx, frontEyeX, eyeY + 4, 62, -0.08)
  } else if (emoji === '😵') {
    drawClosedEye(ctx, rearEyeX, eyeY, 58, 0.5)
    drawClosedEye(ctx, rearEyeX, eyeY, 58, -0.5)
    drawClosedEye(ctx, frontEyeX, eyeY, 52, 0.45)
    drawClosedEye(ctx, frontEyeX, eyeY, 52, -0.45)
  } else {
    drawEye(ctx, rearEyeX, eyeY, 64 * preset.eyeScale, 82 * preset.eyeScale, -8, -4, -0.1 + preset.eyeTilt)
    drawEye(ctx, frontEyeX, eyeY + 2, 72 * preset.eyeScale, 88 * preset.eyeScale, 6, 0, 0.08 + preset.eyeTilt)
    if (emoji === '🥹' || emoji === '🥺') {
      drawPaintBlob(ctx, rearEyeX - 16, eyeY + 44, 14, 18, 'rgba(255,255,255,0.8)')
      drawPaintBlob(ctx, frontEyeX + 12, eyeY + 48, 12, 16, 'rgba(255,255,255,0.72)')
    }
  }

  if (emoji === '😳') {
    drawPaintBlob(ctx, 374, 436, 22, 14, 'rgba(241, 137, 84, 0.35)', 0.2)
    drawPaintBlob(ctx, 570, 432, 18, 12, 'rgba(241, 137, 84, 0.32)', -0.2)
  }

  drawMouth(ctx, preset)
}

export function createFishSpriteTexture(emoji: string) {
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
  drawExpression(ctx, emoji)

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
