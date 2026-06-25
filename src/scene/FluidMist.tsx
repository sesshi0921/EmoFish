import { useMemo, useRef } from 'react'
import { AdditiveBlending, CanvasTexture, Sprite, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'

type MistMode = 'landing' | 'swim'

type MistBlob = {
  phase: number
  drift: number
  size: number
  color: string
  base: Vector3
}

function createBlobTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return new CanvasTexture(canvas)
  }

  const gradient = ctx.createRadialGradient(128, 128, 18, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 245, 184, 0.92)')
  gradient.addColorStop(0.34, 'rgba(248, 200, 54, 0.7)')
  gradient.addColorStop(0.68, 'rgba(248, 200, 54, 0.28)')
  gradient.addColorStop(1, 'rgba(248, 200, 54, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function FluidMist({ mode }: { mode: MistMode }) {
  const texture = useMemo(() => createBlobTexture(), [])
  const blobs = useMemo<MistBlob[]>(
    () =>
      Array.from({ length: mode === 'swim' ? 20 : 7 }, (_, index) => ({
        phase: Math.random() * Math.PI * 2,
        drift: 0.16 + Math.random() * 0.26,
        size: mode === 'swim' ? 0.72 + Math.random() * 0.82 : 0.48 + Math.random() * 0.64,
        color: index % 4 === 0 ? '#fff0a7' : '#f7c63c',
        base: new Vector3((Math.random() - 0.5) * 3.7, (Math.random() - 0.42) * 2.45, -0.65 + Math.random() * 0.75),
      })),
    [mode],
  )
  const refs = useRef<(Sprite | null)[]>([])

  useFrame((state) => {
    refs.current.forEach((sprite, index) => {
      if (!sprite) {
        return
      }

      const blob = blobs[index]
      const t = state.clock.elapsedTime * blob.drift + blob.phase
      const sway = Math.sin(t) * 0.14
      const float = Math.cos(t * 0.8) * 0.1
      sprite.position.set(
        blob.base.x + Math.sin(t * 0.7) * 0.12,
        blob.base.y + float + sway * 0.16,
        blob.base.z + Math.cos(t * 0.9) * 0.08,
      )
      sprite.scale.set(blob.size * 1.45, blob.size * 0.62, 1)
      sprite.rotation.z = Math.sin(t * 0.55) * 0.28 + blob.phase
      sprite.material.opacity = mode === 'swim' ? 0.2 + Math.sin(t) * 0.035 : 0.08 + Math.sin(t) * 0.02
    })
  })

  return (
    <group>
      {blobs.map((blob, index) => (
        <sprite key={index} ref={(node) => { refs.current[index] = node }} position={blob.base.clone()} scale={[blob.size * 1.45, blob.size * 0.62, 1]}>
          <spriteMaterial
            map={texture}
            color={blob.color}
            transparent
            opacity={mode === 'swim' ? 0.2 : 0.08}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}
