import type { Collider } from '../../physics/colliders'

export const BASEMENT_COLLIDERS: Collider[] = [
  { minX: -9.2, maxX: 9.2, minZ: 14.8, maxZ: 15.1 },
  { minX: -9.2, maxX: 9.2, minZ: -16.2, maxZ: -15.9 },
  { minX: -9.2, maxX: -8.9, minZ: -16.2, maxZ: 15.1 },
  { minX: 8.9, maxX: 9.2, minZ: -16.2, maxZ: 15.1 },

  { minX: -9.0, maxX: -2.5, minZ: 1.8, maxZ: 2.1 },
  { minX: 2.5, maxX: 9.0, minZ: 1.8, maxZ: 2.1 },
  { minX: -2.8, maxX: -2.5, minZ: -6.5, maxZ: 2.1 },
  { minX: 6.8, maxX: 7.1, minZ: -6.5, maxZ: 2.1 },
  { minX: -2.8, maxX: 7.1, minZ: -6.8, maxZ: -6.5 },

  { minX: -8.8, maxX: -5.8, minZ: -8.2, maxZ: -7.8 },
  { minX: -4.9, maxX: -1.8, minZ: -8.2, maxZ: -7.8 },
  { minX: -0.9, maxX: 2.2, minZ: -8.2, maxZ: -7.8 },
  { minX: 3.1, maxX: 6.2, minZ: -8.2, maxZ: -7.8 },

  { minX: -7.6, maxX: -7.0, minZ: -14.6, maxZ: -9.0 },
  { minX: -4.6, maxX: -4.0, minZ: -14.6, maxZ: -9.0 },
  { minX: -1.6, maxX: -1.0, minZ: -14.6, maxZ: -9.0 },
  { minX: 1.4, maxX: 2.0, minZ: -14.6, maxZ: -9.0 },
]
