export interface Collider {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export const APARTMENT_COLLIDERS: Collider[] = [
  { minX: -3.56, maxX: 3.56, minZ: -3.06, maxZ: -2.94 },
  { minX: -3.56, maxX: 3.56, minZ: 2.94, maxZ: 3.06 },
  { minX: -3.56, maxX: -3.44, minZ: -3.06, maxZ: 3.06 },
  { minX: 3.44, maxX: 3.56, minZ: -3.06, maxZ: 3.06 },

  { minX: -3.5, maxX: -0.35, minZ: 0.49, maxZ: 0.61 },
  { minX: 0.55, maxX: 0.65, minZ: 0.49, maxZ: 0.61 },

  { minX: 1.39, maxX: 1.51, minZ: -3, maxZ: -0.8 },
  { minX: 1.45, maxX: 1.95, minZ: -0.86, maxZ: -0.74 },
  { minX: 2.85, maxX: 3.5, minZ: -0.86, maxZ: -0.74 },

  { minX: -0.96, maxX: -0.84, minZ: 0.55, maxZ: 1.35 },
  { minX: -0.96, maxX: -0.84, minZ: 2.45, maxZ: 3 },

  { minX: -3.25, maxX: -1.6, minZ: -2.45, maxZ: 0.05 },
  { minX: -1.48, maxX: -0.9, minZ: -2.5, maxZ: -1.78 },
  { minX: -3.35, maxX: -2.65, minZ: 0.02, maxZ: 0.45 },

  { minX: 1.6, maxX: 2.38, minZ: -2.98, maxZ: -2.42 },
  { minX: 2.66, maxX: 3.38, minZ: -2.96, maxZ: -2.12 },
  { minX: 1.62, maxX: 2.28, minZ: -1.78, maxZ: -1.04 },

  { minX: -3.38, maxX: -2.68, minZ: 0.72, maxZ: 2.84 },
  { minX: -2.66, maxX: -1.08, minZ: 2.28, maxZ: 2.86 },

  { minX: 2.05, maxX: 3.25, minZ: 2.36, maxZ: 2.86 },
]
