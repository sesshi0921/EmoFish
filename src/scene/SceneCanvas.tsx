import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Fish, type FishMotionRef } from './Fish'
import { FluidMist } from './FluidMist'
import { MotionArcs } from './MotionArcs'
import { Particles } from './Particles'
import { Ripples } from './Ripples'
import { createSwimState, updateSwimState } from '../lib/fishMotion'

type SceneCanvasProps = {
  emoji: string
  mode: 'landing' | 'swim'
  landingState?: 'falling' | 'flopping' | 'diving'
  onLandingReady?: () => void
  fishEntries?: FishEntry[]
}

export type FishEntry = {
  id: string
  emoji: string
  exiting?: boolean
}

type FishActorProps = SceneCanvasProps & {
  entry: FishEntry
  spawnIndex?: number
}

function FishActor({ entry, mode, landingState = 'falling', onLandingReady, spawnIndex = 0 }: FishActorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const motionRef = useRef({ tailAngle: 0, finAngle: 0, bodyBend: 0, speed: 0, turnRate: 0 })
  const swimState = useMemo(() => createSwimState(Math.random() * Math.PI + spawnIndex), [spawnIndex])
  const forwardRef = useRef(new THREE.Vector3(1, 0, 0))
  const directionRef = useRef(new THREE.Vector3(1, 0, 0))
  const orientationRef = useRef(new THREE.Quaternion())
  const targetOrientationRef = useRef(new THREE.Quaternion())
  const bornAtRef = useRef<number | null>(null)
  const exitAtRef = useRef<number | null>(null)
  const diveStartedAtRef = useRef<number | null>(null)
  const [renderOpacity, setRenderOpacity] = useState(1)
  const [rippleBurst, setRippleBurst] = useState(0)
  const [arcBurst, setArcBurst] = useState(0)
  const hasAnnouncedLanding = useRef(false)
  const diveRippleSent = useRef(false)
  const lastArcAtRef = useRef(0)
  const motionEnergyRef = useRef(0)

  useEffect(() => {
    if (landingState !== 'falling') {
      hasAnnouncedLanding.current = true
    }
    if (landingState !== 'diving') {
      diveStartedAtRef.current = null
      diveRippleSent.current = false
    }
  }, [landingState])

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return
    }

    const elapsed = state.clock.elapsedTime
    if (bornAtRef.current === null) {
      bornAtRef.current = elapsed
    }
    if (entry.exiting && exitAtRef.current === null) {
      exitAtRef.current = elapsed
    }
    let x = 0
    let y = 0
    let z = 0
    let tailAngle = 0
    let finAngle = 0
    let bodyBend = 0
    let speedValue = 0
    let turnRateValue = 0
    let motionEnergy = 0
    let rotationZ = 0
    let swimDirection: THREE.Vector3 | null = null
    let fadeOpacity = 1

    if (mode === 'landing') {
      if (landingState === 'falling') {
        const fallT = Math.min(elapsed / 0.9, 1)
        x = Math.sin(fallT * Math.PI) * 0.1
        y = THREE.MathUtils.lerp(1.42, -0.64, 1 - Math.pow(1 - fallT, 2))
        rotationZ = THREE.MathUtils.lerp(-0.34, 0.1, fallT)
        tailAngle = Math.sin(elapsed * 16) * 0.08
        speedValue = 0.04

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
        motionEnergy = Math.abs(flop) * 0.48 + kick * 0.42
      } else {
        if (diveStartedAtRef.current === null) {
          diveStartedAtRef.current = elapsed
        }
        const diveT = THREE.MathUtils.clamp((elapsed - diveStartedAtRef.current) / 1.22, 0, 1)
        const jump = Math.sin(diveT * Math.PI) * 0.96
        x = THREE.MathUtils.lerp(-0.18, 1.08, diveT) - Math.sin(diveT * Math.PI) * 0.12
        y = -0.64 + jump - diveT * diveT * 0.72
        z = THREE.MathUtils.lerp(0.02, -0.28, diveT)
        rotationZ = THREE.MathUtils.lerp(-0.18, -1.18, diveT) + Math.sin(diveT * Math.PI) * 0.32
        tailAngle = Math.sin(elapsed * 28) * (0.54 - diveT * 0.14)
        finAngle = Math.sin(elapsed * 17) * 0.58
        bodyBend = 0.14 + Math.sin(diveT * Math.PI) * 0.14
        speedValue = 0.52 + Math.sin(diveT * Math.PI) * 0.18
        turnRateValue = -0.3
        motionEnergy = Math.abs(Math.sin(diveT * Math.PI)) * 0.7 + 0.32

        if (diveT > 0.74 && !diveRippleSent.current) {
          diveRippleSent.current = true
          setRippleBurst((current) => current + 1)
        }
      }
    } else {
      updateSwimState(swimState, elapsed, delta)
      x = swimState.position.x
      y = swimState.position.y
      z = swimState.position.z

      const spawnT = THREE.MathUtils.clamp((elapsed - bornAtRef.current) / 1.15, 0, 1)
      if (spawnT < 1) {
        const eased = 1 - Math.pow(1 - spawnT, 3)
        x = THREE.MathUtils.lerp(Math.sin(spawnIndex * 1.7) * 0.72, x, eased)
        y = THREE.MathUtils.lerp(1.36, y, eased)
        z = THREE.MathUtils.lerp(-0.42, z, eased)
      }

      if (exitAtRef.current !== null) {
        const exitT = THREE.MathUtils.clamp((elapsed - exitAtRef.current) / 0.8, 0, 1)
        fadeOpacity = 1 - exitT
        y += exitT * 0.18
      }

      const speed = swimState.velocity.length()
      const turn = THREE.MathUtils.clamp(swimState.turnRate * 0.34, -1, 1)
      swimDirection = directionRef.current
        .set(swimState.velocity.x, swimState.velocity.y, swimState.velocity.z * 1.4)
        .normalize()
      tailAngle =
        Math.sin(elapsed * (5.2 + speed * 16)) * (0.16 + speed * 0.54 + Math.abs(turn) * 0.22) -
        turn * 0.34
      finAngle = Math.sin(elapsed * (8 + speed * 18)) * (0.14 + speed * 0.16)
      bodyBend = -turn * 0.58 + Math.sin(elapsed * (2 + speed * 1.6)) * 0.025
      speedValue = speed
      turnRateValue = swimState.turnRate
      motionEnergy = speed * 0.72 + Math.abs(turn) * 0.98 + Math.abs(bodyBend) * 0.18
    }

    if (motionEnergy > 0.58 && elapsed - lastArcAtRef.current > 0.18) {
      lastArcAtRef.current = elapsed
      setArcBurst((current) => current + 1)
    }
    motionEnergyRef.current = motionEnergy

    groupRef.current.position.set(x, y, z)
    if (swimDirection) {
      targetOrientationRef.current.setFromUnitVectors(forwardRef.current, swimDirection)
      orientationRef.current.slerp(targetOrientationRef.current, Math.min(delta * 3.2, 0.18))
      groupRef.current.quaternion.copy(orientationRef.current)
    } else {
      groupRef.current.rotation.set(0, 0, rotationZ)
      orientationRef.current.copy(groupRef.current.quaternion)
    }
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.82, 1, fadeOpacity))
    setRenderOpacity((current) => (Math.abs(current - fadeOpacity) > 0.04 ? fadeOpacity : current))
    motionRef.current.tailAngle = tailAngle
    motionRef.current.finAngle = finAngle
    motionRef.current.bodyBend = bodyBend
    motionRef.current.speed = speedValue
    motionRef.current.turnRate = turnRateValue
  })

  return (
    <>
      <group ref={groupRef}>
        <Fish emoji={entry.emoji} motionRef={motionRef as FishMotionRef} opacity={renderOpacity} />
        <MotionArcs burst={arcBurst} energy={motionEnergyRef.current} />
      </group>
      <Ripples mode={mode} burst={rippleBurst} />
    </>
  )
}

export function SceneCanvas({ emoji, mode, landingState, onLandingReady, fishEntries }: SceneCanvasProps) {
  const entries = fishEntries ?? [{ id: 'single', emoji }]

  return (
    <Canvas
      className="scene-canvas"
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.6], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.55} />
      <directionalLight position={[2.6, 4, 3.2]} intensity={0.72} />
      <hemisphereLight args={['#fff7c8', '#e8ad19', 0.48]} />

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
          <FluidMist mode={mode} />
          <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 6]} />
            <meshStandardMaterial color="#f1b61e" roughness={1} />
          </mesh>
          <Particles />
        </>
      )}

      {mode === 'swim' ? (
        entries.map((entry, index) => (
          <FishActor
            key={entry.id}
            entry={entry}
            emoji={entry.emoji}
            mode={mode}
            landingState={landingState}
            onLandingReady={onLandingReady}
            spawnIndex={index}
          />
        ))
      ) : (
        <FishActor
          entry={{ id: 'landing', emoji }}
          emoji={emoji}
          mode={mode}
          landingState={landingState}
          onLandingReady={onLandingReady}
        />
      )}
    </Canvas>
  )
}
