import * as THREE from 'three'

export type FishGeometry = THREE.BufferGeometry & {
  userData: {
    basePositions: Float32Array
  }
}

function getHalfHeight(normalizedX: number) {
  if (normalizedX < 0.14) {
    return THREE.MathUtils.lerp(0.06, 0.24, normalizedX / 0.14)
  }
  if (normalizedX < 0.42) {
    return THREE.MathUtils.lerp(0.24, 0.39, (normalizedX - 0.14) / 0.28)
  }
  if (normalizedX < 0.76) {
    return THREE.MathUtils.lerp(0.39, 0.37, (normalizedX - 0.42) / 0.34)
  }
  const capT = (normalizedX - 0.76) / 0.24
  const roundedFace = 0.37 * (0.2 + Math.cos(capT * Math.PI * 0.5) * 0.8)
  return Math.max(0.058, roundedFace)
}

function getHalfDepth(normalizedX: number) {
  if (normalizedX < 0.14) {
    return THREE.MathUtils.lerp(0.03, 0.15, normalizedX / 0.14)
  }
  if (normalizedX < 0.46) {
    return THREE.MathUtils.lerp(0.15, 0.29, (normalizedX - 0.14) / 0.32)
  }
  if (normalizedX < 0.76) {
    return THREE.MathUtils.lerp(0.29, 0.27, (normalizedX - 0.46) / 0.3)
  }
  const capT = (normalizedX - 0.76) / 0.24
  const roundedFace = 0.27 * (0.22 + Math.cos(capT * Math.PI * 0.5) * 0.78)
  return Math.max(0.052, roundedFace)
}

export function createFishBodyGeometry() {
  const lengthSegments = 58
  const radialSegments = 30
  const noseX = 0.66
  const tailX = -0.58
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
      if (normalizedX >= 0.65) {
        const faceT = (normalizedX - 0.65) / 0.35
        const edgeEase = THREE.MathUtils.smoothstep(faceT, 0, 1)
        const faceU = 0.79 + (z / 0.29) * 0.255 + (edgeEase - 0.5) * 0.018
        const faceV = 0.5 + (y / 0.39) * 0.455
        uvs.push(
          THREE.MathUtils.clamp(faceU, 0.5, 0.998),
          THREE.MathUtils.clamp(faceV, 0.035, 0.965),
        )
      } else {
        uvs.push(xT, radialIndex / radialSegments)
      }
    }
  }

  const tailCapIndex = positions.length / 3
  positions.push(tailX, 0, 0)
  uvs.push(0, 0.5)

  const noseCapIndex = positions.length / 3
  positions.push(noseX, 0, 0)
  uvs.push(0.79, 0.5)

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

  const tailRingStart = 0
  const noseRingStart = lengthSegments * ringSize
  for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
    const tailA = tailRingStart + radialIndex
    const tailB = tailRingStart + radialIndex + 1
    indices.push(tailCapIndex, tailA, tailB)

    const noseA = noseRingStart + radialIndex
    const noseB = noseRingStart + radialIndex + 1
    indices.push(noseCapIndex, noseA, noseB)
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

export function deformFishBody(
  geometry: FishGeometry,
  motion: {
    tailAngle: number
    bodyBend: number
    speed: number
    turnRate: number
  },
) {
  deformFishGeometry(geometry, motion, 1)
}

function deformFishGeometry(
  geometry: FishGeometry,
  motion: {
    tailAngle: number
    bodyBend: number
    speed: number
    turnRate: number
  },
  tailWeight: number,
) {
  const positions = geometry.attributes.position as THREE.BufferAttribute
  const base = geometry.userData.basePositions

  for (let index = 0; index < positions.count; index += 1) {
    const offset = index * 3
    const baseX = base[offset]
    const baseY = base[offset + 1]
    const baseZ = base[offset + 2]
    const normalizedX = THREE.MathUtils.clamp((baseX + 0.58) / 1.24, 0, 1)

    const headLock = THREE.MathUtils.smoothstep(normalizedX, 0.64, 1)
    const tailInfluence = 1 - THREE.MathUtils.smoothstep(normalizedX, 0.08, 0.48)

    const bendOffset = motion.bodyBend * Math.pow(Math.max(0, 1 - normalizedX), 1.35) * 0.3 * tailWeight
    const tailOffset = motion.tailAngle * tailInfluence * 0.24 * tailWeight
    const turnLift = motion.turnRate * (0.08 + tailInfluence * 0.06) * (1 - Math.abs(baseY) * 1.4) * tailWeight
    const speedCompression = motion.speed * headLock * 0.045

    positions.setXYZ(
      index,
      baseX,
      baseY,
      baseZ * (1 - speedCompression) + bendOffset + tailOffset + turnLift,
    )
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
}
