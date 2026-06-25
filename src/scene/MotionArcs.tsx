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
      const baseScale = 0.24 + Math.min(0.12, energy * 0.08)
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
      )
    }

    for (const arc of items) {
      arc.age += delta
    }

    arcsRef.current = items.filter((arc) => arc.age < 0.42)

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
      child.scale.setScalar(arc.scale * (1 + arc.age * 0.28))
      const material = (child.children[0] as Mesh | undefined)?.material
      if (material && !Array.isArray(material)) {
        ;(material as Material & { opacity: number }).opacity = Math.max(0, 0.18 - arc.age * 0.42)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {meshes.map((_, index) => (
        <group key={index} visible={false}>
          <mesh>
            <torusGeometry args={[0.36, 0.016, 8, 24, 1.04]} />
            <meshBasicMaterial color="#ffd84a" transparent opacity={0.16} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
