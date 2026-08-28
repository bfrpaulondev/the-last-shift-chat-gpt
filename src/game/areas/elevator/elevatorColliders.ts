import type { Collider } from '../../physics/colliders'

export const ELEVATOR_COLLIDERS: Collider[] = [
  { minX: -2.15, maxX: -1.85, minZ: -2.15, maxZ: 2.15 },
  { minX: 1.85, maxX: 2.15, minZ: -2.15, maxZ: 2.15 },
  { minX: -2.15, maxX: 2.15, minZ: 1.85, maxZ: 2.15 },
  { minX: -2.15, maxX: -0.82, minZ: -2.15, maxZ: -1.85 },
  { minX: 0.82, maxX: 2.15, minZ: -2.15, maxZ: -1.85 },
]
