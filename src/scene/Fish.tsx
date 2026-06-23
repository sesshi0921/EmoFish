import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createFishSpriteTexture, createTailTexture } from '../lib/fishTexture'

export type FishMotionRef = RefObject<{
  tailAngle: number
  finAngle: number
  bodyBend: number
} | null>

type FishProps = {
  emoji: string
  motionRef: FishMotionRef
}

export function Fish({ emoji, motionRef }: FishProps) {
  const spriteTexture = useMemo(() => createFishSpriteTexture(emoji), [emoji])
  const tailTexture = useMemo(() => createTailTexture(), [])
  const rootRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const motion = motionRef.current
    if (!motion) {
      return
    }

    if (rootRef.current) {
      rootRef.current.rotation.z = motion.bodyBend * 0.24
      rootRef.current.position.y = Math.sin(motion.finAngle * 1.5) * 0.015
    }

    if (tailRef.current) {
      tailRef.current.rotation.z = motion.tailAngle * 0.9
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = motion.tailAngle * 0.05
    }
  })

  useEffect(() => {
    return () => {
      spriteTexture.dispose()
      tailTexture.dispose()
    }
  }, [spriteTexture, tailTexture])

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: spriteTexture,
        transparent: true,
        alphaTest: 0.08,
        side: THREE.DoubleSide,
      }),
    [spriteTexture],
  )

  const tailMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tailTexture,
        transparent: true,
        alphaTest: 0.08,
        side: THREE.DoubleSide,
      }),
    [tailTexture],
  )

  useEffect(() => {
    return () => {
      bodyMaterial.dispose()
      tailMaterial.dispose()
    }
  }, [bodyMaterial, tailMaterial])

  return (
    <group ref={rootRef} scale={[1.22, 1.06, 1]}>
      <group ref={tailRef} position={[-0.9, -0.02, -0.02]}>
        <mesh material={tailMaterial} position={[-0.12, 0, 0]}>
          <planeGeometry args={[0.54, 0.56]} />
        </mesh>
      </group>

      <mesh ref={bodyRef} material={bodyMaterial} position={[0.02, 0.02, 0.04]}>
        <planeGeometry args={[1.72, 1.26]} />
      </mesh>
    </group>
  )
}
