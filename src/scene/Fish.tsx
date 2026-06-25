import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createFinTexture, createFishBodyTexture } from '../lib/fishTexture'
import {
  createDorsalFinGeometry,
  createFinGeometry,
  createFishBodyGeometry,
  deformFishBody,
  type FishGeometry,
} from '../lib/fishModel'

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
  opacity?: number
}

export function Fish({ emoji, motionRef, opacity = 1 }: FishProps) {
  const bodyTexture = useMemo(() => createFishBodyTexture(emoji), [emoji])
  const finTexture = useMemo(() => createFinTexture(), [])
  const bodyGeometry = useMemo(() => createFishBodyGeometry(), [])
  const tailGeometry = useMemo(() => createFinGeometry(0.44, 0.56), [])
  const pectoralGeometry = useMemo(() => createFinGeometry(0.34, 0.36), [])
  const dorsalGeometry = useMemo(() => createDorsalFinGeometry(), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const tailRef = useRef<THREE.Mesh>(null)
  const topFinRef = useRef<THREE.Mesh>(null)
  const sideFinRef = useRef<THREE.Mesh>(null)
  const farSideFinRef = useRef<THREE.Mesh>(null)

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: bodyTexture,
        transparent: opacity < 1,
        opacity,
        roughness: 0.88,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [bodyTexture, opacity],
  )

  const finMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: finTexture,
        transparent: true,
        opacity,
        alphaTest: 0.05,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [finTexture, opacity],
  )

  const outlineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#d58d13',
        transparent: true,
        opacity: 0.26,
        side: THREE.BackSide,
      }),
    [],
  )

  useFrame(() => {
    const motion = motionRef.current
    if (!motion) {
      return
    }

    deformFishBody(bodyGeometry as FishGeometry, motion)

    const bend = motion.bodyBend + motion.turnRate * 0.12
    const tail = motion.tailAngle

    if (rootRef.current) {
      rootRef.current.rotation.z = bend * 0.08
      rootRef.current.position.y = Math.sin(motion.finAngle * 1.2) * 0.012
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = bend * 0.04
    }

    if (tailRef.current) {
      tailRef.current.rotation.y = tail * 0.82 + bend * 0.26
      tailRef.current.position.z = tail * 0.13 + bend * 0.08
    }

    if (topFinRef.current) {
      topFinRef.current.rotation.z = -0.1 + bend * 0.18
    }

    if (sideFinRef.current) {
      sideFinRef.current.rotation.z = 0.34 + Math.sin(motion.finAngle) * 0.18
      sideFinRef.current.rotation.y = -0.42 + Math.sin(motion.finAngle * 1.4) * 0.08
    }

    if (farSideFinRef.current) {
      farSideFinRef.current.rotation.z = -0.34 - Math.sin(motion.finAngle) * 0.18
      farSideFinRef.current.rotation.y = Math.PI + 0.42 - Math.sin(motion.finAngle * 1.4) * 0.08
    }
  })

  useEffect(() => {
    return () => {
      bodyTexture.dispose()
      finTexture.dispose()
      bodyGeometry.dispose()
      tailGeometry.dispose()
      pectoralGeometry.dispose()
      dorsalGeometry.dispose()
      bodyMaterial.dispose()
      finMaterial.dispose()
      outlineMaterial.dispose()
    }
  }, [
    bodyGeometry,
    bodyMaterial,
    bodyTexture,
    dorsalGeometry,
    finMaterial,
    finTexture,
    outlineMaterial,
    pectoralGeometry,
    tailGeometry,
  ])

  return (
    <group ref={rootRef} scale={[0.5, 0.49, 0.5]}>
      <mesh geometry={bodyGeometry} material={outlineMaterial} scale={[1.035, 1.035, 1.035]} />
      <mesh ref={bodyRef} geometry={bodyGeometry} material={bodyMaterial} />

      <mesh
        ref={tailRef}
        geometry={tailGeometry}
        material={finMaterial}
        position={[-0.53, 0, 0]}
        rotation={[0, 0.1, 0]}
      />

      <mesh
        ref={topFinRef}
        geometry={dorsalGeometry}
        material={finMaterial}
        position={[0.02, 0.36, -0.01]}
        rotation={[0, 0.08, -0.04]}
        scale={[1, 1, 1]}
      />

      <mesh
        ref={sideFinRef}
        geometry={pectoralGeometry}
        material={finMaterial}
        position={[0.03, -0.03, 0.36]}
        rotation={[0.08, -1.02, 0.18]}
        scale={[1.18, 0.98, 1]}
      />

      <mesh
        ref={farSideFinRef}
        geometry={pectoralGeometry}
        material={finMaterial}
        position={[0.03, -0.03, -0.36]}
        rotation={[0.08, Math.PI + 1.02, -0.18]}
        scale={[1.18, 0.98, 1]}
      />
    </group>
  )
}
