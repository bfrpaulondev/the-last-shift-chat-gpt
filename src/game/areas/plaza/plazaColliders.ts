import type { Collider } from '../../physics/colliders'

export const PLAZA_COLLIDERS: Collider[] = [
  { minX: -9.2, maxX: -8.6, minZ: -7.8, maxZ: 8.4 },
  { minX: 8.6, maxX: 9.2, minZ: -7.8, maxZ: 8.4 },
  { minX: -9.2, maxX: 9.2, minZ: 8.0, maxZ: 8.6 },
  { minX: -9.2, maxX: -1.45, minZ: -7.9, maxZ: -7.2 },
  { minX: 1.45, maxX: 9.2, minZ: -7.9, maxZ: -7.2 },
  { minX: -3.9, maxX: -2.4, minZ: -2.6, maxZ: -1.0 },
  { minX: 2.4, maxX: 3.9, minZ: -2.6, maxZ: -1.0 },
]
