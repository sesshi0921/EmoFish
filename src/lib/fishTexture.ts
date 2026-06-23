import * as THREE from 'three'

function drawPaintBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  rotation: number,
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

export function createFishBodyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const texture = new THREE.Texture()
    texture.needsUpdate = true
    return texture
  }

  ctx.fillStyle = '#f7ca42'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let index = 0; index < 32; index += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const width = 18 + Math.random() * 80
    const height = 10 + Math.random() * 56
    const alpha = 0.04 + Math.random() * 0.1
    drawPaintBlob(ctx, x, y, width, height, `rgba(255,255,255,${alpha})`, Math.random() * Math.PI)
  }

  for (let index = 0; index < 18; index += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const width = 20 + Math.random() * 96
    const height = 8 + Math.random() * 40
    const alpha = 0.03 + Math.random() * 0.08
    drawPaintBlob(ctx, x, y, width, height, `rgba(214,145,16,${alpha})`, Math.random() * Math.PI)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1.3, 1.3)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
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
  ctx.font = '320px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 + 8)

  ctx.globalCompositeOperation = 'destination-in'
  const gradient = ctx.createRadialGradient(256, 256, 70, 256, 256, 252)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.82, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(256, 256, 252, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}
