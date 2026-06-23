import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createEmojiFaceTexture, createFishSpriteTexture, createTailTexture } from '../lib/fishTexture'

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
  const spriteTexture = useMemo(() => createFishSpriteTexture(), [])
  const faceTexture = useMemo(() => createEmojiFaceTexture(emoji), [emoji])
  const tailTexture = useMemo(() => createTailTexture(), [])
  const rootRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const faceRef = useRef<THREE.Mesh>(null)

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

    if (faceRef.current) {
      faceRef.current.rotation.z = motion.tailAngle * 0.03
    }
  })

  useEffect(() => {
    return () => {
      spriteTexture.dispose()
      faceTexture.dispose()
      tailTexture.dispose()
    }
  }, [faceTexture, spriteTexture, tailTexture])

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

  const faceMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: faceTexture,
        transparent: true,
        alphaTest: 0.04,
        side: THREE.DoubleSide,
      }),
    [faceTexture],
  )

  useEffect(() => {
    return () => {
      bodyMaterial.dispose()
      faceMaterial.dispose()
      tailMaterial.dispose()
    }
  }, [bodyMaterial, faceMaterial, tailMaterial])

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

      <mesh ref={faceRef} material={faceMaterial} position={[-0.22, 0.03, 0.09]} rotation={[0, 0, -0.05]}>
        <planeGeometry args={[0.64, 0.64]} />
      </mesh>
    </group>
  )
}
