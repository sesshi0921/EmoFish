import { useMemo, useRef } from 'react'
import { BufferAttribute, Points } from 'three'
import { useFrame } from '@react-three/fiber'

export function Particles() {
  const pointsRef = useRef<Points>(null)
  const count = 72

  const positions = useMemo(() => {
    const values = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * 3.2
      values[index * 3 + 1] = (Math.random() - 0.2) * 2.2
      values[index * 3 + 2] = (Math.random() - 0.5) * 1.2
    }
    return values
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) {
      return
    }

    const array = pointsRef.current.geometry.getAttribute('position') as BufferAttribute
    for (let index = 0; index < count; index += 1) {
      const yIndex = index * 3 + 1
      array.array[yIndex] += 0.0009 + Math.sin(state.clock.elapsedTime + index) * 0.0002
      if (array.array[yIndex] > 1.28) {
        array.array[yIndex] = -1.2
      }
    }
    array.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#fff2a8" size={0.028} transparent opacity={0.72} />
    </points>
  )
}
