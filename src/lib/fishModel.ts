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
    return THREE.MathUtils.lerp(0.39, 0.38, (normalizedX - 0.42) / 0.34)
  }
  const capT = (normalizedX - 0.76) / 0.24
  return Math.max(0.03, Math.cos(capT * Math.PI * 0.5) * 0.38)
}

function getHalfDepth(normalizedX: number) {
  if (normalizedX < 0.14) {
    return THREE.MathUtils.lerp(0.03, 0.15, normalizedX / 0.14)
  }
  if (normalizedX < 0.46) {
    return THREE.MathUtils.lerp(0.15, 0.29, (normalizedX - 0.14) / 0.32)
  }
  if (normalizedX < 0.76) {
    return THREE.MathUtils.lerp(0.29, 0.28, (normalizedX - 0.46) / 0.3)
  }
  const capT = (normalizedX - 0.76) / 0.24
  return Math.max(0.025, Math.cos(capT * Math.PI * 0.5) * 0.28)
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
  const columns = 34
  const rows = 30
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const halfWidth = 0.37
  const halfHeight = 0.35
  const capDepth = 0.15

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows
    const yT = 1 - v * 2

    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns
      const xT = u * 2 - 1
      const radius = Math.min(1, xT * xT * 0.7 + yT * yT * 0.9)
      const cap = Math.sqrt(Math.max(0, 1 - radius))
      const edgeTaper = 1 - radius * 0.14

      positions.push(cap * capDepth, yT * halfHeight, xT * halfWidth * edgeTaper)
      uvs.push(u, v)
    }
  }

  const rowSize = columns + 1
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * rowSize + column
      const b = a + 1
      const c = a + rowSize
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
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
    const normalizedX = THREE.MathUtils.clamp((baseX + 0.58) / 1.24, 0, 1)

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
