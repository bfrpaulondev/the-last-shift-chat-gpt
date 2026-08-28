import type { Collider } from '../../physics/colliders'

export const BLACKOUT_COLLIDERS: Collider[] = [
  { minX: -4.9, maxX: -4.55, minZ: -6.6, maxZ: 6.6 },
  { minX: 4.55, maxX: 4.9, minZ: -6.6, maxZ: 6.6 },
  { minX: -4.9, maxX: 4.9, minZ: -6.6, maxZ: -6.25 },
  { minX: -4.9, maxX: -1.35, minZ: 6.25, maxZ: 6.6 },
  { minX: 1.35, maxX: 4.9, minZ: 6.25, maxZ: 6.6 },
  { minX: -4.15, maxX: -2.45, minZ: -1.25, maxZ: 0.15 },
  { minX: 2.45, maxX: 4.1, minZ: -1.0, maxZ: 0.45 },
]
