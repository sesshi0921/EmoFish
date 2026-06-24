import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createFishSpriteTexture } from '../lib/fishTexture'

export type FishMotionRef = RefObject<{
  tailAngle: number
  finAngle: number
  bodyBend: number
  speed: number
  turnRate: number
} | null>

type FishProps = {
  emoji: string
  motionRef: FishMotionRef
}

type FishGeometry = THREE.BufferGeometry & {
  userData: {
    basePositions: Float32Array
  }
}

function createFishPlaneGeometry() {
  const geometry = new THREE.PlaneGeometry(2.18, 1.36, 50, 30) as unknown as FishGeometry
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  for (let index = 0; index < uv.count; index += 1) {
    const u = uv.getX(index)
    const warpedU = u < 0.42 ? u * 0.48 : 0.2016 + ((u - 0.42) / 0.58) * 0.7984
    uv.setXY(index, warpedU, uv.getY(index))
  }
  uv.needsUpdate = true
  const basePositions = new Float32Array(geometry.attributes.position.array)
  geometry.userData.basePositions = basePositions
  return geometry
}

function updateFishGeometry(geometry: FishGeometry, motion: NonNullable<FishMotionRef['current']>) {
  const positions = geometry.attributes.position as THREE.BufferAttribute
  const base = geometry.userData.basePositions

  for (let index = 0; index < positions.count; index += 1) {
    const offset = index * 3
    const baseX = base[offset]
    const baseY = base[offset + 1]

    const normalizedX = (baseX + 1.09) / 2.18
    const bodyBlend = 1 - normalizedX
    const tailBlend = 1 - THREE.MathUtils.smoothstep(normalizedX, 0.02, 0.42)
    const headLock = THREE.MathUtils.smoothstep(0.56, 0.92, normalizedX)

    const bend = motion.bodyBend * bodyBlend
    const tailSwing = motion.tailAngle * tailBlend
    const lateralOffset = Math.sin(baseY * 2.4) * (bend * 0.12 + tailSwing * 0.1)
    const verticalOffset = Math.sin(normalizedX * Math.PI) * motion.turnRate * 0.04

    const bodyRadiusX = Math.max(0, 1 - Math.pow(baseX / 0.98, 2))
    const bodyRadiusY = Math.max(0, 1 - Math.pow(baseY / 0.56, 2))
    const bulge = Math.sqrt(bodyRadiusX * bodyRadiusY) * (0.16 + headLock * 0.08)
    const tailThickness = tailBlend * Math.max(0, 0.08 - Math.abs(baseY) * 0.1)
    const speedCompression = motion.speed * headLock * 0.08

    positions.setXYZ(
      index,
      baseX,
      baseY + lateralOffset + verticalOffset,
      bulge + tailThickness - speedCompression,
    )
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
}

export function Fish({ emoji, motionRef }: FishProps) {
  const spriteTexture = useMemo(() => createFishSpriteTexture(emoji), [emoji])
  const bodyGeometry = useMemo(() => createFishPlaneGeometry(), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const motion = motionRef.current
    if (!motion) {
      return
    }

    if (rootRef.current) {
      rootRef.current.rotation.z = motion.bodyBend * 0.12
      rootRef.current.position.y = Math.sin(motion.finAngle * 1.4) * 0.012
    }

    updateFishGeometry(bodyGeometry, motion)

    if (bodyRef.current) {
      bodyRef.current.rotation.z = motion.tailAngle * 0.02
    }
  })

  useEffect(() => {
    return () => {
      spriteTexture.dispose()
      bodyGeometry.dispose()
    }
  }, [bodyGeometry, spriteTexture])

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: spriteTexture,
        transparent: true,
        alphaTest: 0.08,
        roughness: 0.92,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [spriteTexture],
  )

  useEffect(() => {
    return () => {
      bodyMaterial.dispose()
    }
  }, [bodyMaterial])

  return (
    <group ref={rootRef} scale={[0.98, 0.88, 1]}>
      <mesh ref={bodyRef} geometry={bodyGeometry} material={bodyMaterial} />
    </group>
  )
}
