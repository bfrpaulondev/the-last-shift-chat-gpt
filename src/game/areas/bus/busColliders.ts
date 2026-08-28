import type { Collider } from '../../physics/colliders'

export const BUS_COLLIDERS: Collider[] = [
  { minX: -1.34, maxX: -1.08, minZ: -4.55, maxZ: 4.55 },
  { minX: 1.08, maxX: 1.34, minZ: -4.55, maxZ: 4.55 },
  { minX: -1.34, maxX: 1.34, minZ: -4.62, maxZ: -4.34 },
  { minX: -1.34, maxX: 1.34, minZ: 4.34, maxZ: 4.62 },
  { minX: -1.1, maxX: -0.49, minZ: -3.15, maxZ: 3.05 },
  { minX: 0.49, maxX: 1.1, minZ: -3.15, maxZ: 3.05 },
  { minX: 0.34, maxX: 1.1, minZ: -4.25, maxZ: -3.35 },
]
