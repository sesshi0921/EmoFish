import * as THREE from 'three'

export type SwimState = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  target: THREE.Vector3
  nextTargetAt: number
  seed: number
  heading: number
  turnRate: number
  speed: number
}

export function createSwimState(seed: number) {
  return {
    position: new THREE.Vector3(-0.2, 0.08, 0),
    velocity: new THREE.Vector3(0.32, 0.06, 0),
    target: new THREE.Vector3(0.8, 0.12, 0.08),
    nextTargetAt: 0,
    seed,
    heading: 0.18,
    turnRate: 0,
    speed: 0.34,
  }
}

function wrapAngle(angle: number) {
  while (angle > Math.PI) {
    angle -= Math.PI * 2
  }
  while (angle < -Math.PI) {
    angle += Math.PI * 2
  }
  return angle
}

export function updateSwimState(state: SwimState, elapsed: number, delta: number) {
  if (elapsed >= state.nextTargetAt) {
    const phase = elapsed * 0.34 + state.seed * 1.7
    state.target.set(
      Math.cos(phase) * 0.96 + Math.sin(phase * 1.8) * 0.22,
      THREE.MathUtils.clamp(Math.sin(phase * 1.2) * 0.42, -0.46, 0.58),
      Math.sin(phase * 0.9) * 0.22,
    )
    state.nextTargetAt = elapsed + 1.8 + Math.abs(Math.sin(elapsed * 0.7 + state.seed)) * 1.1
  }

  const toTarget = state.target.clone().sub(state.position)
  const desiredHeading = Math.atan2(toTarget.y, toTarget.x)
  const angleDelta = wrapAngle(desiredHeading - state.heading)
  const maxTurn = (0.82 + Math.min(toTarget.length(), 1.2) * 0.46) * delta
  const headingStep = THREE.MathUtils.clamp(angleDelta, -maxTurn, maxTurn)

  state.heading = wrapAngle(state.heading + headingStep)
  state.turnRate = THREE.MathUtils.lerp(state.turnRate, headingStep / Math.max(delta, 0.001), Math.min(delta * 2.2, 1))

  const desiredSpeed =
    0.24 +
    Math.min(toTarget.length(), 1.4) * 0.22 +
    Math.max(0, 0.8 - Math.abs(angleDelta)) * 0.08 +
    Math.max(0, Math.sin(elapsed * 1.7 + state.seed)) * 0.05
  state.speed = THREE.MathUtils.lerp(state.speed, desiredSpeed, Math.min(delta * 1.4, 1))

  state.velocity.set(Math.cos(state.heading), Math.sin(state.heading), 0).multiplyScalar(state.speed)
  state.position.addScaledVector(state.velocity, delta)
  state.position.z = THREE.MathUtils.lerp(state.position.z, state.target.z, Math.min(delta * 0.9, 1))

  if (state.position.x > 1.36 || state.position.x < -1.36) {
    state.target.x = state.position.x > 0 ? -0.82 : 0.82
    state.target.y = THREE.MathUtils.clamp(state.position.y + Math.sin(elapsed + state.seed) * 0.46, -0.46, 0.58)
    state.nextTargetAt = elapsed + 1.2
  }
  if (state.position.y > 0.74 || state.position.y < -0.62) {
    state.target.y = state.position.y > 0 ? -0.36 : 0.44
    state.target.x = THREE.MathUtils.clamp(state.position.x + Math.cos(elapsed * 0.8 + state.seed) * 0.84, -1.04, 1.04)
    state.nextTargetAt = elapsed + 1.2
  }

  state.position.x = THREE.MathUtils.clamp(state.position.x, -1.4, 1.4)
  state.position.y = THREE.MathUtils.clamp(state.position.y, -0.66, 0.78)
  state.position.z = THREE.MathUtils.clamp(state.position.z, -0.28, 0.3)
}
