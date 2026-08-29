import type { Collider } from '../../physics/colliders'

export const BLACKOUT_COLLIDERS: Collider[] = [
  { minX: -5.9, maxX: -5.45, minZ: -7.6, maxZ: 7.6 },
  { minX: 5.45, maxX: 5.9, minZ: -7.6, maxZ: 7.6 },
  { minX: -5.9, maxX: 5.9, minZ: -7.6, maxZ: -7.15 },
  { minX: -5.9, maxX: -1.35, minZ: 7.05, maxZ: 7.6 },
  { minX: 1.35, maxX: 5.9, minZ: 7.05, maxZ: 7.6 },
  { minX: -5.15, maxX: -2.3, minZ: -2.8, maxZ: -1.2 },
  { minX: 1.8, maxX: 5.15, minZ: -2.8, maxZ: -1.15 },
  { minX: -1.35, maxX: -0.2, minZ: -0.75, maxZ: 0.55 },
]
