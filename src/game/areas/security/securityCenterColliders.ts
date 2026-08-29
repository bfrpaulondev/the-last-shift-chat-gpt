import type { Collider } from '../../physics/colliders'

export const SECURITY_CENTER_COLLIDERS: Collider[] = [
  { minX: -5.2, maxX: -4.9, minZ: -6.7, maxZ: 6.7 },
  { minX: 4.9, maxX: 5.2, minZ: -6.7, maxZ: 6.7 },
  { minX: -5.2, maxX: 5.2, minZ: -6.7, maxZ: -6.4 },
  { minX: -5.2, maxX: -1.3, minZ: 6.4, maxZ: 6.7 },
  { minX: 1.3, maxX: 5.2, minZ: 6.4, maxZ: 6.7 },
  { minX: -4.2, maxX: 2.4, minZ: -2.5, maxZ: -1.55 },
  { minX: 1.85, maxX: 4.15, minZ: -0.2, maxZ: 1.15 },
]
