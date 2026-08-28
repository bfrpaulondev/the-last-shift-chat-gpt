import type { Collider } from '../../physics/colliders'

export const FLOOR30_COLLIDERS: Collider[] = [
  { minX: -5.7, maxX: -5.35, minZ: -7.1, maxZ: 7.1 },
  { minX: 5.35, maxX: 5.7, minZ: -7.1, maxZ: 7.1 },
  { minX: -5.7, maxX: 5.7, minZ: -7.1, maxZ: -6.75 },
  { minX: -5.7, maxX: -1.2, minZ: 6.75, maxZ: 7.1 },
  { minX: 1.2, maxX: 5.7, minZ: 6.75, maxZ: 7.1 },
  { minX: -4.9, maxX: -1.8, minZ: -2.8, maxZ: -1.5 },
  { minX: 1.5, maxX: 4.7, minZ: -3.4, maxZ: -2.0 },
  { minX: -4.4, maxX: -2.8, minZ: 1.0, maxZ: 2.6 },
]
