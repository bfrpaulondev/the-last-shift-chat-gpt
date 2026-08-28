import type { Collider } from '../../physics/colliders'

export const STREET_COLLIDERS: Collider[] = [
  { minX: -6.3, maxX: -5.9, minZ: -1.1, maxZ: 6.8 },
  { minX: 5.9, maxX: 6.3, minZ: -1.1, maxZ: 6.8 },
  { minX: -6.3, maxX: 6.3, minZ: 6.5, maxZ: 6.9 },
  { minX: -6.3, maxX: 6.3, minZ: -1.28, maxZ: -0.94 },
  { minX: 0.56, maxX: 3.66, minZ: 0.48, maxZ: 0.78 },
  { minX: 0.56, maxX: 0.86, minZ: 0.48, maxZ: 2.7 },
  { minX: 3.36, maxX: 3.66, minZ: 0.48, maxZ: 2.7 },
]
