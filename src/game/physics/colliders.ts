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
]
