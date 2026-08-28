import type { Collider } from '../../physics/colliders'

export const STAIRWELL_COLLIDERS: Collider[] = [
  { minX: -4.3, maxX: -4.0, minZ: -7.4, maxZ: 7.4 },
  { minX: 4.0, maxX: 4.3, minZ: -7.4, maxZ: 7.4 },
  { minX: -4.3, maxX: 4.3, minZ: -7.4, maxZ: -7.1 },
  { minX: -4.3, maxX: -1.25, minZ: 7.1, maxZ: 7.4 },
  { minX: 1.25, maxX: 4.3, minZ: 7.1, maxZ: 7.4 },
  { minX: -1.15, maxX: 1.15, minZ: -0.75, maxZ: 0.75 },
  { minX: -3.75, maxX: -2.2, minZ: 2.2, maxZ: 3.5 },
  { minX: 2.15, maxX: 3.75, minZ: -3.6, maxZ: -2.15 },
]
