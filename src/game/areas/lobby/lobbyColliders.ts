import type { Collider } from '../../physics/colliders'

export const LOBBY_COLLIDERS: Collider[] = [
  { minX: -6.1, maxX: -5.55, minZ: -6.1, maxZ: 6.1 },
  { minX: 5.55, maxX: 6.1, minZ: -6.1, maxZ: 6.1 },
  { minX: -6.1, maxX: 6.1, minZ: 5.55, maxZ: 6.1 },
  { minX: -6.1, maxX: 3.55, minZ: -6.1, maxZ: -5.55 },
  { minX: 5.25, maxX: 6.1, minZ: -6.1, maxZ: -5.55 },
  { minX: -2.5, maxX: 2.5, minZ: -3.45, maxZ: -2.35 },
  { minX: -5.55, maxX: -3.72, minZ: -1.62, maxZ: 1.22 },
  { minX: -3.2, maxX: -1.3, minZ: 1.85, maxZ: 2.75 },
  { minX: 1.3, maxX: 3.2, minZ: 1.85, maxZ: 2.75 },
]
