import type { Collider } from '../../physics/colliders'

export const DESCENT_COLLIDERS: Collider[] = [
  { minX: -2.65, maxX: -2.35, minZ: -4.8, maxZ: 4.8 },
  { minX: 2.35, maxX: 2.65, minZ: -4.8, maxZ: 4.8 },
  { minX: -2.65, maxX: 2.65, minZ: 4.55, maxZ: 4.85 },
]

export const NIGHT_LOBBY_COLLIDERS: Collider[] = [
  { minX: -5.95, maxX: -5.65, minZ: -5.95, maxZ: 5.95 },
  { minX: 5.65, maxX: 5.95, minZ: -5.95, maxZ: 5.95 },
  { minX: -5.95, maxX: 5.95, minZ: -5.95, maxZ: -5.65 },
  { minX: -5.95, maxX: -1.5, minZ: 5.55, maxZ: 5.95 },
  { minX: 1.5, maxX: 5.95, minZ: 5.55, maxZ: 5.95 },
  { minX: -2.35, maxX: 2.35, minZ: -3.5, maxZ: -2.45 },
]
