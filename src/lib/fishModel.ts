import * as THREE from 'three'

export type FishGeometry = THREE.BufferGeometry & {
  userData: {
    basePositions: Float32Array
  }
}

function getHalfHeight(normalizedX: number) {
  if (normalizedX < 0.14) {
    return THREE.MathUtils.lerp(0.08, 0.3, normalizedX / 0.14)
  }
  if (normalizedX < 0.42) {
    return THREE.MathUtils.lerp(0.3, 0.49, (normalizedX - 0.14) / 0.28)
  }
  if (normalizedX < 0.76) {
    return THREE.MathUtils.lerp(0.49, 0.48, (normalizedX - 0.42) / 0.34)
  }
  const capT = (normalizedX - 0.76) / 0.24
  return Math.max(0.035, Math.cos(capT * Math.PI * 0.5) * 0.48)
}

function getHalfDepth(normalizedX: number) {
  if (normalizedX < 0.14) {
    return THREE.MathUtils.lerp(0.04, 0.2, normalizedX / 0.14)
  }
  if (normalizedX < 0.46) {
    return THREE.MathUtils.lerp(0.2, 0.38, (normalizedX - 0.14) / 0.32)
  }
  if (normalizedX < 0.76) {
    return THREE.MathUtils.lerp(0.38, 0.36, (normalizedX - 0.46) / 0.3)
  }
  const capT = (normalizedX - 0.76) / 0.24
  return Math.max(0.03, Math.cos(capT * Math.PI * 0.5) * 0.36)
}

export function createFishBodyGeometry() {
  const lengthSegments = 58
  const radialSegments = 30
  const noseX = 0.74
  const tailX = -0.68
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let xIndex = 0; xIndex <= lengthSegments; xIndex += 1) {
    const xT = xIndex / lengthSegments
    const normalizedX = xT
    const x = THREE.MathUtils.lerp(tailX, noseX, xT)
    const halfHeight = getHalfHeight(normalizedX)
    const halfDepth = getHalfDepth(normalizedX)

    for (let radialIndex = 0; radialIndex <= radialSegments; radialIndex += 1) {
      const angle = (radialIndex / radialSegments) * Math.PI * 2
      const y = Math.cos(angle) * halfHeight
      const z = Math.sin(angle) * halfDepth

      positions.push(x, y, z)
      uvs.push(xT, radialIndex / radialSegments)
    }
  }

  const ringSize = radialSegments + 1
  for (let xIndex = 0; xIndex < lengthSegments; xIndex += 1) {
    for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
      const a = xIndex * ringSize + radialIndex
      const b = a + ringSize
      const c = a + 1
      const d = b + 1
      indices.push(a, b, c, c, b, d)
    }
  }

  const geometry = new THREE.BufferGeometry() as FishGeometry
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.userData.basePositions = new Float32Array(positions)
  return geometry
}

export function createFinGeometry(width: number, height: number) {
  const geometry = new THREE.PlaneGeometry(width, height, 12, 8)
  const positions = geometry.attributes.position as THREE.BufferAttribute

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const edge = Math.abs(y / (height * 0.5))
    positions.setZ(index, Math.max(0, 1 - edge) * 0.06 - Math.abs(x) * 0.02)
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export function createHeadFaceGeometry() {
  const geometry = new THREE.PlaneGeometry(0.76, 0.7, 18, 18)
  const positions = geometry.attributes.position as THREE.BufferAttribute

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const normalizedX = x / 0.38
    const normalizedY = y / 0.35
    const edge = Math.min(1, normalizedX * normalizedX + normalizedY * normalizedY)
    positions.setZ(index, (1 - edge) * 0.08)
    positions.setX(index, x * (1 - Math.abs(normalizedY) * 0.08))
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export function deformFishBody(
  geometry: FishGeometry,
  motion: {
    tailAngle: number
    bodyBend: number
    speed: number
    turnRate: number
  },
) {
  const positions = geometry.attributes.position as THREE.BufferAttribute
  const base = geometry.userData.basePositions

  for (let index = 0; index < positions.count; index += 1) {
    const offset = index * 3
    const baseX = base[offset]
    const baseY = base[offset + 1]
    const baseZ = base[offset + 2]
    const normalizedX = THREE.MathUtils.clamp((baseX + 0.68) / 1.42, 0, 1)

    const headLock = THREE.MathUtils.smoothstep(normalizedX, 0.64, 1)
    const tailInfluence = 1 - THREE.MathUtils.smoothstep(normalizedX, 0.08, 0.48)

    const bendOffset = motion.bodyBend * Math.pow(Math.max(0, 1 - normalizedX), 1.35) * 0.3
    const tailOffset = motion.tailAngle * tailInfluence * 0.24
    const turnLift = motion.turnRate * (0.08 + tailInfluence * 0.06) * (1 - Math.abs(baseY) * 1.4)
    const speedCompression = motion.speed * headLock * 0.045

    positions.setXYZ(
      index,
      baseX,
      baseY + bendOffset + tailOffset + turnLift,
      baseZ * (1 - speedCompression) + tailInfluence * 0.02,
    )
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
}
