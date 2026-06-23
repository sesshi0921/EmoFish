import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createEmojiFaceTexture, createFishBodyTexture } from '../lib/fishTexture'

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
  const bodyTexture = useMemo(() => createFishBodyTexture(), [])
  const faceTexture = useMemo(() => createEmojiFaceTexture(emoji), [emoji])
  const rootRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const topFinRef = useRef<THREE.Mesh>(null)
  const finLeftRef = useRef<THREE.Mesh>(null)
  const finRightRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const motion = motionRef.current
    if (!motion) {
      return
    }

    if (rootRef.current) {
      rootRef.current.rotation.z = motion.bodyBend * 0.18
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = motion.tailAngle
    }
    if (topFinRef.current) {
      topFinRef.current.rotation.z = 0.3 + motion.finAngle * 0.35
    }
    if (finLeftRef.current) {
      finLeftRef.current.rotation.z = -0.55 - motion.finAngle * 0.45
    }
    if (finRightRef.current) {
      finRightRef.current.rotation.z = 0.55 + motion.finAngle * 0.45
    }
  })

  useEffect(() => {
    return () => {
      bodyTexture.dispose()
      faceTexture.dispose()
    }
  }, [bodyTexture, faceTexture])

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f7c737',
        map: bodyTexture,
        roughness: 0.92,
        metalness: 0.02,
      }),
    [bodyTexture],
  )

  const finMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d98b16',
        roughness: 1,
      }),
    [],
  )

  const faceMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: faceTexture,
        transparent: true,
      }),
    [faceTexture],
  )

  useEffect(() => {
    return () => {
      bodyMaterial.dispose()
      finMaterial.dispose()
      faceMaterial.dispose()
    }
  }, [bodyMaterial, faceMaterial, finMaterial])

  return (
    <group ref={rootRef} scale={[1.28, 0.92, 1.02]}>
      <mesh material={bodyMaterial} castShadow receiveShadow>
        <sphereGeometry args={[0.44, 40, 40]} />
      </mesh>

      <mesh position={[0.14, 0.01, 0.33]} rotation={[0, 0, 0.22]} material={faceMaterial}>
        <planeGeometry args={[0.48, 0.48]} />
      </mesh>

      <group ref={tailRef} position={[-0.56, 0.02, 0]}>
        <mesh material={finMaterial} rotation={[0, 0, 0.1]}>
          <coneGeometry args={[0.16, 0.34, 3]} />
        </mesh>
        <mesh position={[-0.03, -0.07, 0]} material={finMaterial} rotation={[0, 0, -0.18]}>
          <coneGeometry args={[0.12, 0.26, 3]} />
        </mesh>
      </group>

      <mesh ref={topFinRef} position={[0.08, 0.21, 0]} rotation={[0.34, 0, 0.3]} material={finMaterial}>
        <coneGeometry args={[0.08, 0.24, 3]} />
      </mesh>
      <mesh ref={finLeftRef} position={[0.12, -0.18, 0.18]} rotation={[-0.1, 0.3, -0.55]} material={finMaterial}>
        <coneGeometry args={[0.09, 0.28, 3]} />
      </mesh>
      <mesh ref={finRightRef} position={[0.12, -0.18, -0.18]} rotation={[0.1, -0.3, 0.55]} material={finMaterial}>
        <coneGeometry args={[0.09, 0.28, 3]} />
      </mesh>
    </group>
  )
}
