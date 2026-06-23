import { useMemo, useRef } from 'react'
import { Group, Material, Mesh } from 'three'
import { useFrame } from '@react-three/fiber'

type Ripple = {
  id: number
  age: number
  x: number
  y: number
  z: number
}

type RipplesProps = {
  mode: 'landing' | 'swim'
  burst?: number
}

export function Ripples({ mode, burst = 0 }: RipplesProps) {
  const groupRef = useRef<Group>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const lastBurstRef = useRef(0)

  const ripples = useMemo(() => new Array(8).fill(null), [])

  useFrame((_, delta) => {
    const items = ripplesRef.current

    if (mode === 'landing' && burst > lastBurstRef.current) {
      lastBurstRef.current = burst
      items.push(
        { id: burst * 10 + 1, age: 0, x: 0, y: -0.6, z: 0 },
        { id: burst * 10 + 2, age: 0.15, x: 0.18, y: -0.58, z: -0.12 },
        { id: burst * 10 + 3, age: 0.25, x: -0.2, y: -0.56, z: 0.08 },
      )
    }

    if (mode === 'swim' && Math.random() < delta * 1.4) {
      items.push({
        id: Date.now() + Math.random(),
        age: 0,
        x: (Math.random() - 0.5) * 1.8,
        y: (Math.random() - 0.1) * 1.1,
        z: (Math.random() - 0.5) * 0.5,
      })
    }

    for (const ripple of items) {
      ripple.age += delta
    }

    ripplesRef.current = items.filter((ripple) => ripple.age < 1.2)

    if (!groupRef.current) {
      return
    }

    groupRef.current.children.forEach((child, index) => {
      const ripple = ripplesRef.current[index]
      child.visible = Boolean(ripple)
      if (!ripple) {
        return
      }

      const scale = 0.24 + ripple.age * 1.12
      child.position.set(ripple.x, ripple.y, ripple.z)
      child.scale.setScalar(scale)
      const material = (child.children[0] as Mesh | undefined)?.material
      if (material && !Array.isArray(material)) {
        ;(material as Material & { opacity: number }).opacity = Math.max(0, 0.36 - ripple.age * 0.28)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {ripples.map((_, index) => (
        <group key={index} visible={false}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.52, 0.66, 48]} />
            <meshBasicMaterial color="#f8d342" transparent opacity={0.32} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
