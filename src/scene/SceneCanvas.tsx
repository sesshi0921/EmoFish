import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Fish, type FishMotionRef } from './Fish'
import { Particles } from './Particles'
import { Ripples } from './Ripples'
import { createSwimState, updateSwimState } from '../lib/fishMotion'

type SceneCanvasProps = {
  emoji: string
  mode: 'landing' | 'swim'
  landingState?: 'falling' | 'flopping' | 'diving'
  onLandingReady?: () => void
}

type FishActorProps = SceneCanvasProps

function FishActor({ emoji, mode, landingState = 'falling', onLandingReady }: FishActorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const motionRef = useRef({ tailAngle: 0, finAngle: 0, bodyBend: 0 })
  const swimState = useMemo(() => createSwimState(Math.random() * Math.PI), [])
  const [rippleBurst, setRippleBurst] = useState(0)
  const hasAnnouncedLanding = useRef(false)
  const diveRippleSent = useRef(false)

  useEffect(() => {
    if (landingState !== 'falling') {
      hasAnnouncedLanding.current = true
    }
  }, [landingState])

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return
    }

    const elapsed = state.clock.elapsedTime
    let x = 0
    let y = 0
    let z = 0
    let tailAngle = 0
    let finAngle = 0
    let bodyBend = 0
    let rotationZ = 0
    let facing = 1

    if (mode === 'landing') {
      if (landingState === 'falling') {
        const fallT = Math.min(elapsed / 0.85, 1)
        x = Math.sin(fallT * Math.PI) * 0.12
        y = THREE.MathUtils.lerp(1.42, -0.64, 1 - Math.pow(1 - fallT, 2))
        rotationZ = THREE.MathUtils.lerp(-0.4, 0.15, fallT)
        tailAngle = Math.sin(elapsed * 16) * 0.08
        facing = 1

        if (fallT >= 1 && !hasAnnouncedLanding.current) {
          hasAnnouncedLanding.current = true
          onLandingReady?.()
        }
      } else if (landingState === 'flopping') {
        const flop = Math.sin(elapsed * 8.4)
        const kick = Math.max(0, Math.sin(elapsed * 4.2))
        x = Math.sin(elapsed * 2.8) * 0.18
        y = -0.64 + Math.abs(flop) * 0.2
        z = Math.sin(elapsed * 3.2) * 0.06
        rotationZ = flop * 0.5
        tailAngle = Math.sin(elapsed * 18) * 0.7
        finAngle = Math.sin(elapsed * 11.2) * 0.8
        bodyBend = flop * 0.34 + kick * 0.18
        facing = flop < 0 ? -1 : 1
      } else {
        const diveT = Math.min((elapsed % 10) / 0.9, 1)
        x = THREE.MathUtils.lerp(0, 0.9, diveT)
        y = THREE.MathUtils.lerp(-0.52, -1.12, diveT * diveT)
        z = THREE.MathUtils.lerp(0, -0.24, diveT)
        rotationZ = THREE.MathUtils.lerp(-0.1, -0.95, diveT)
        tailAngle = Math.sin(elapsed * 24) * (0.5 - diveT * 0.12)
        finAngle = Math.sin(elapsed * 15) * 0.5
        bodyBend = 0.18
        facing = 1

        if (diveT > 0.4 && !diveRippleSent.current) {
          diveRippleSent.current = true
          setRippleBurst((current) => current + 1)
        }
      }
    } else {
      updateSwimState(swimState, elapsed, delta)
      x = swimState.position.x
      y = swimState.position.y
      z = swimState.position.z

      const speed = swimState.velocity.length()
      const heading = Math.atan2(swimState.velocity.y, swimState.velocity.x)
      const turn = THREE.MathUtils.clamp(swimState.target.y - swimState.position.y, -1, 1)
      rotationZ = heading * 0.46
      tailAngle = Math.sin(elapsed * (6 + speed * 14)) * (0.24 + speed * 0.52 + Math.abs(turn) * 0.2)
      finAngle = Math.sin(elapsed * (9 + speed * 20)) * 0.26
      bodyBend = turn * 0.34 + Math.sin(elapsed * 2.1) * 0.06
      facing = swimState.velocity.x >= 0 ? 1 : -1
    }

    groupRef.current.position.set(x, y, z)
    groupRef.current.rotation.set(0, 0, rotationZ)
    groupRef.current.scale.set(facing, 1, 1)
    motionRef.current.tailAngle = tailAngle
    motionRef.current.finAngle = finAngle
    motionRef.current.bodyBend = bodyBend
  })

  return (
    <>
      <group ref={groupRef}>
        <Fish emoji={emoji} motionRef={motionRef as FishMotionRef} />
      </group>
      <Ripples mode={mode} burst={rippleBurst} />
    </>
  )
}

export function SceneCanvas({ emoji, mode, landingState, onLandingReady }: SceneCanvasProps) {
  return (
    <Canvas
      className="scene-canvas"
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.6], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={2.1} />
      <directionalLight position={[2.6, 4, 3.2]} intensity={1.6} />
      <hemisphereLight args={['#fff7c8', '#e8ad19', 0.8]} />

      {mode === 'landing' ? (
        <>
          <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[7, 4.2]} />
            <meshStandardMaterial color="#f0d481" roughness={1} />
          </mesh>
          <mesh position={[0, -0.82, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.44, 48]} />
            <meshBasicMaterial color="#efc136" transparent opacity={landingState === 'diving' ? 0.2 : 0.12} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 6]} />
            <meshStandardMaterial color="#f1b61e" roughness={1} />
          </mesh>
          <Particles />
        </>
      )}

      <FishActor emoji={emoji} mode={mode} landingState={landingState} onLandingReady={onLandingReady} />
    </Canvas>
  )
}
