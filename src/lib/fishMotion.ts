import * as THREE from 'three'

export type SwimState = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  target: THREE.Vector3
  nextTargetAt: number
  seed: number
}

export function createSwimState(seed: number) {
  return {
    position: new THREE.Vector3(0, 0.18, 0),
    velocity: new THREE.Vector3(0.38, 0.08, 0),
    target: new THREE.Vector3(0.7, 0.1, 0.2),
    nextTargetAt: 0,
    seed,
  }
}

export function updateSwimState(state: SwimState, elapsed: number, delta: number) {
  if (elapsed >= state.nextTargetAt) {
    const jitter = Math.sin(elapsed * 0.77 + state.seed) * 0.5 + 0.5
    state.target.set(
      THREE.MathUtils.randFloatSpread(2.2) * 0.65,
      THREE.MathUtils.clamp(Math.sin(elapsed * 0.5 + state.seed) * 0.45, -0.44, 0.56),
      (jitter - 0.5) * 0.8,
    )
    state.nextTargetAt = elapsed + 1.4 + Math.random() * 1.8
  }

  const desiredVelocity = state.target.clone().sub(state.position).normalize().multiplyScalar(0.38)
  state.velocity.lerp(desiredVelocity, Math.min(delta * 0.82, 1))
  state.position.addScaledVector(state.velocity, delta)

  state.position.x = THREE.MathUtils.clamp(state.position.x, -1.35, 1.35)
  state.position.y = THREE.MathUtils.clamp(state.position.y, -0.58, 0.72)
  state.position.z = THREE.MathUtils.clamp(state.position.z, -0.65, 0.65)

  if (Math.abs(state.position.x) >= 1.3) {
    state.target.x *= -1
  }
  if (Math.abs(state.position.y) >= 0.55) {
    state.target.y *= -1
  }
}
