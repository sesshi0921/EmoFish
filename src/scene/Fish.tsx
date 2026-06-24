import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createEmojiFaceTexture, createFinTexture, createFishBodyTexture } from '../lib/fishTexture'
import {
  createFinGeometry,
  createFishBodyGeometry,
  createHeadFaceGeometry,
  deformFishBody,
  deformFishFace,
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
}

export function Fish({ emoji, motionRef }: FishProps) {
  const bodyTexture = useMemo(() => createFishBodyTexture(), [])
  const faceTexture = useMemo(() => createEmojiFaceTexture(emoji), [emoji])
  const finTexture = useMemo(() => createFinTexture(), [])
  const bodyGeometry = useMemo(() => createFishBodyGeometry(), [])
  const faceGeometry = useMemo(() => createHeadFaceGeometry(), [])
  const tailGeometry = useMemo(() => createFinGeometry(0.34, 0.44), [])
  const pectoralGeometry = useMemo(() => createFinGeometry(0.28, 0.3), [])
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const faceRef = useRef<THREE.Mesh>(null)
  const tailRef = useRef<THREE.Mesh>(null)
  const topFinRef = useRef<THREE.Mesh>(null)
  const sideFinRef = useRef<THREE.Mesh>(null)

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: bodyTexture,
        roughness: 0.88,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [bodyTexture],
  )

  const finMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: finTexture,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [finTexture],
  )

  const faceMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: faceTexture,
        transparent: true,
        alphaTest: 0.04,
        roughness: 0.96,
        metalness: 0,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    [faceTexture],
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
    deformFishFace(faceGeometry as FishGeometry, motion)

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
  })

  useEffect(() => {
    return () => {
      bodyTexture.dispose()
      faceTexture.dispose()
      finTexture.dispose()
      bodyGeometry.dispose()
      faceGeometry.dispose()
      tailGeometry.dispose()
      pectoralGeometry.dispose()
      bodyMaterial.dispose()
      faceMaterial.dispose()
      finMaterial.dispose()
      outlineMaterial.dispose()
    }
  }, [
    bodyGeometry,
    bodyMaterial,
    bodyTexture,
    faceGeometry,
    faceMaterial,
    faceTexture,
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
        ref={faceRef}
        geometry={faceGeometry}
        material={faceMaterial}
      />

      <mesh
        ref={tailRef}
        geometry={tailGeometry}
        material={finMaterial}
        position={[-0.53, 0, 0]}
        rotation={[0, 0.1, 0]}
      />

      <mesh
        ref={topFinRef}
        geometry={pectoralGeometry}
        material={finMaterial}
        position={[0.18, 0.35, -0.02]}
        rotation={[0, 0.25, -0.12]}
        scale={[0.88, 0.72, 1]}
      />

      <mesh
        ref={sideFinRef}
        geometry={pectoralGeometry}
        material={finMaterial}
        position={[0.12, -0.13, 0.2]}
        rotation={[0.12, -0.42, 0.34]}
        scale={[0.8, 0.62, 1]}
      />
    </group>
  )
}
