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
  const motionRef = useRef({ tailAngle: 0, finAngle: 0, bodyBend: 0, speed: 0, turnRate: 0 })
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
    let speedValue = 0
    let turnRateValue = 0
    let rotationZ = 0
    let facing = 1

    if (mode === 'landing') {
      if (landingState === 'falling') {
        const fallT = Math.min(elapsed / 0.9, 1)
        x = Math.sin(fallT * Math.PI) * 0.1
        y = THREE.MathUtils.lerp(1.42, -0.64, 1 - Math.pow(1 - fallT, 2))
        rotationZ = THREE.MathUtils.lerp(-0.34, 0.1, fallT)
        tailAngle = Math.sin(elapsed * 16) * 0.08
        speedValue = 0.04
        facing = 1

        if (fallT >= 1 && !hasAnnouncedLanding.current) {
          hasAnnouncedLanding.current = true
          onLandingReady?.()
        }
      } else if (landingState === 'flopping') {
        const flop = Math.sin(elapsed * 7.6)
        const kick = Math.max(0, Math.sin(elapsed * 4.8))
        x = Math.sin(elapsed * 2.4) * 0.2
        y = -0.66 + Math.abs(flop) * 0.24
        z = Math.sin(elapsed * 3.8) * 0.05
        rotationZ = flop * 0.42
        tailAngle = Math.sin(elapsed * 19.4) * (0.62 + kick * 0.18)
        finAngle = Math.sin(elapsed * 12.2) * 0.9
        bodyBend = flop * 0.42 + kick * 0.16
        speedValue = 0.24 + kick * 0.18
        turnRateValue = flop * 0.36
        facing = flop < 0 ? -1 : 1
      } else {
        const diveT = Math.min((elapsed % 10) / 0.9, 1)
        x = THREE.MathUtils.lerp(0, 1.04, diveT) - Math.sin(diveT * Math.PI) * 0.08
        y = THREE.MathUtils.lerp(-0.48, -1.14, diveT * diveT) - Math.sin(diveT * Math.PI) * 0.1
        z = THREE.MathUtils.lerp(0, -0.24, diveT)
        rotationZ = THREE.MathUtils.lerp(-0.08, -0.9, diveT)
        tailAngle = Math.sin(elapsed * 25) * (0.46 - diveT * 0.1)
        finAngle = Math.sin(elapsed * 15) * 0.5
        bodyBend = 0.12 + Math.sin(diveT * Math.PI) * 0.08
        speedValue = 0.46
        turnRateValue = -0.22
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
      const heading = swimState.heading
      const turn = THREE.MathUtils.clamp(swimState.turnRate * 0.22, -1, 1)
      rotationZ = heading * 0.46
      tailAngle =
        Math.sin(elapsed * (5.2 + speed * 16)) * (0.16 + speed * 0.56 + Math.abs(turn) * 0.34)
      finAngle = Math.sin(elapsed * (8 + speed * 18)) * (0.14 + speed * 0.16)
      bodyBend = turn * 0.46 + Math.sin(elapsed * (2 + speed * 1.6)) * 0.03
      speedValue = speed
      turnRateValue = swimState.turnRate
      facing = swimState.velocity.x >= 0 ? 1 : -1
    }

    groupRef.current.position.set(x, y, z)
    groupRef.current.rotation.set(0, 0, rotationZ)
    groupRef.current.scale.set(facing, 1, 1)
    motionRef.current.tailAngle = tailAngle
    motionRef.current.finAngle = finAngle
    motionRef.current.bodyBend = bodyBend
    motionRef.current.speed = speedValue
    motionRef.current.turnRate = turnRateValue
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
