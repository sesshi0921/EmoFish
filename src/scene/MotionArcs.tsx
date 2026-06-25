import { useMemo, useRef } from 'react'
import { AdditiveBlending, Group, Material, Mesh } from 'three'
import { useFrame } from '@react-three/fiber'

type ArcItem = {
  id: number
  age: number
  offsetX: number
  offsetY: number
  offsetZ: number
  rotationX: number
  rotationY: number
  rotationZ: number
  scale: number
}

type MotionArcsProps = {
  burst: number
  energy: number
}

export function MotionArcs({ burst, energy }: MotionArcsProps) {
  const groupRef = useRef<Group>(null)
  const arcsRef = useRef<ArcItem[]>([])
  const lastBurstRef = useRef(0)
  const meshes = useMemo(() => new Array(8).fill(null), [])

  useFrame((_, delta) => {
    const items = arcsRef.current

    if (burst > lastBurstRef.current) {
      lastBurstRef.current = burst
      const baseScale = 0.34 + Math.min(0.2, energy * 0.15)
      items.push(
        {
          id: burst * 10 + 1,
          age: 0,
          offsetX: 0.06,
          offsetY: 0.05,
          offsetZ: 0.16,
          rotationX: 0.3,
          rotationY: 0.1,
          rotationZ: -0.3,
          scale: baseScale,
        },
        {
          id: burst * 10 + 2,
          age: 0.08,
          offsetX: -0.08,
          offsetY: -0.03,
          offsetZ: -0.12,
          rotationX: -0.18,
          rotationY: 0.24,
          rotationZ: 0.42,
          scale: baseScale * 0.92,
        },
        {
          id: burst * 10 + 3,
          age: 0.14,
          offsetX: 0.02,
          offsetY: -0.09,
          offsetZ: 0.05,
          rotationX: 0.52,
          rotationY: -0.08,
          rotationZ: 0.14,
          scale: baseScale * 1.12,
        },
      )
    }

    for (const arc of items) {
      arc.age += delta
    }

    arcsRef.current = items.filter((arc) => arc.age < 0.75)

    if (!groupRef.current) {
      return
    }

    groupRef.current.children.forEach((child, index) => {
      const arc = arcsRef.current[index]
      child.visible = Boolean(arc)
      if (!arc) {
        return
      }

      child.position.set(arc.offsetX, arc.offsetY, arc.offsetZ)
      child.rotation.set(arc.rotationX, arc.rotationY, arc.rotationZ + arc.age * 1.8)
      child.scale.setScalar(arc.scale * (1 + arc.age * 0.48))
      const material = (child.children[0] as Mesh | undefined)?.material
      if (material && !Array.isArray(material)) {
        ;(material as Material & { opacity: number }).opacity = Math.max(0, 0.44 - arc.age * 0.56)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {meshes.map((_, index) => (
        <group key={index} visible={false}>
          <mesh>
            <torusGeometry args={[0.36, 0.028, 10, 28, 1.3]} />
            <meshBasicMaterial color="#ffd84a" transparent opacity={0.32} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
