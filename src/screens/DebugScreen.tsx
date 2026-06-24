import { Canvas } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { EmojiInput } from '../components/EmojiInput'
import { Fish } from '../scene/Fish'
import type { FishMotionRef } from '../scene/Fish'

function DebugFish({ emoji, yaw, pitch, roll }: { emoji: string; yaw: number; pitch: number; roll: number }) {
  const motionRef = useRef({
    tailAngle: 0,
    finAngle: 0,
    bodyBend: 0,
    speed: 0,
    turnRate: 0,
  })

  return (
    <group rotation={[THREE.MathUtils.degToRad(pitch), THREE.MathUtils.degToRad(yaw), THREE.MathUtils.degToRad(roll)]}>
      <Fish emoji={emoji} motionRef={motionRef as FishMotionRef} />
    </group>
  )
}

export function DebugScreen() {
  const [emoji, setEmoji] = useState('🫪')
  const [yaw, setYaw] = useState(-90)
  const [pitch, setPitch] = useState(0)
  const [roll, setRoll] = useState(0)

  return (
    <main className="debug-screen">
      <div className="debug-badge">DEBUG</div>
      <Canvas
        className="debug-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.4], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={2.2} />
        <directionalLight position={[2.6, 4, 3.2]} intensity={1.6} />
        <hemisphereLight args={['#fff7c8', '#e8ad19', 0.8]} />
        <DebugFish emoji={emoji || '🫪'} yaw={yaw} pitch={pitch} roll={roll} />
      </Canvas>

      <section className="debug-panel">
        <EmojiInput value={emoji} onChange={setEmoji} />
        {[
          ['yaw', yaw, setYaw],
          ['pitch', pitch, setPitch],
          ['roll', roll, setRoll],
        ].map(([label, value, setter]) => (
          <label className="debug-control" key={label as string}>
            <span>{label as string}</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={value as number}
              onChange={(event) => (setter as (next: number) => void)(Number(event.target.value))}
            />
            <input
              type="number"
              min="-180"
              max="180"
              value={value as number}
              onChange={(event) => (setter as (next: number) => void)(Number(event.target.value))}
            />
          </label>
        ))}
      </section>
    </main>
  )
}
