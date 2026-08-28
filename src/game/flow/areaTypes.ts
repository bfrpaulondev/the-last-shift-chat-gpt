export type GamePart = 'part-1' | 'part-2'

export type GameArea =
  | 'apartment'
  | 'street'
  | 'bus-214'
  | 'meridian-plaza'
  | 'lobby'
  | 'locker-b1'
  | 'service-elevator'
  | 'work-floor-22'
  | 'work-floor-30'
  | 'cafeteria'
  | 'floor-37'
  | 'blackout'

export interface PlayerSpawn {
  x: number
  y: number
  z: number
  yaw: number
}

export interface GameLocationSnapshot {
  part: GamePart
  area: GameArea
  checkpoint: string
  spawn?: PlayerSpawn
}

export interface AreaDefinition {
  area: GameArea
  part: GamePart
  chapter: string
  label: string
  defaultCheckpoint: string
  defaultSpawn?: PlayerSpawn
}

export const AREA_DEFINITIONS: Record<GameArea, AreaDefinition> = {
  apartment: {
    area: 'apartment',
    part: 'part-1',
    chapter: 'part-1-apartment',
    label: 'Apartamento',
    defaultCheckpoint: 'apartment-bed',
    defaultSpawn: { x: -1.52, y: 1.35, z: -0.45, yaw: Math.PI },
  },
  street: {
    area: 'street',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Rua / Ponto 214',
    defaultCheckpoint: 'street-arrival',
    defaultSpawn: { x: 0, y: 1.65, z: 2.4, yaw: Math.PI },
  },
  'bus-214': {
    area: 'bus-214',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Ônibus 214',
    defaultCheckpoint: 'bus-boarded',
  },
  'meridian-plaza': {
    area: 'meridian-plaza',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Praça Meridian',
    defaultCheckpoint: 'plaza-arrival',
  },
  lobby: {
    area: 'lobby',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Portaria / Lobby',
    defaultCheckpoint: 'lobby-entry',
  },
  'locker-b1': {
    area: 'locker-b1',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Vestiário B1',
    defaultCheckpoint: 'locker-entry',
  },
  'service-elevator': {
    area: 'service-elevator',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Elevador de Serviço',
    defaultCheckpoint: 'elevator-cabin',
  },
  'work-floor-22': {
    area: 'work-floor-22',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: '22.º Andar',
    defaultCheckpoint: 'floor-22-arrival',
  },
  'work-floor-30': {
    area: 'work-floor-30',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: '30.º Andar',
    defaultCheckpoint: 'floor-30-arrival',
  },
  cafeteria: {
    area: 'cafeteria',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Refeitório',
    defaultCheckpoint: 'cafeteria-arrival',
  },
  'floor-37': {
    area: 'floor-37',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: '37.º Andar',
    defaultCheckpoint: 'floor-37-arrival',
  },
  blackout: {
    area: 'blackout',
    part: 'part-2',
    chapter: 'part-2-road-to-meridian',
    label: 'Blackout',
    defaultCheckpoint: 'knocked-out',
  },
}

export const INITIAL_LOCATION: GameLocationSnapshot = {
  part: 'part-1',
  area: 'apartment',
  checkpoint: 'apartment-bed',
  spawn: AREA_DEFINITIONS.apartment.defaultSpawn,
}

export function locationForArea(
  area: GameArea,
  checkpoint?: string,
  spawn?: PlayerSpawn,
): GameLocationSnapshot {
  const definition = AREA_DEFINITIONS[area]
  return {
    part: definition.part,
    area,
    checkpoint: checkpoint ?? definition.defaultCheckpoint,
    spawn: spawn ?? definition.defaultSpawn,
  }
}

export function isGameArea(value: unknown): value is GameArea {
  return typeof value === 'string' && value in AREA_DEFINITIONS
}

export function isGamePart(value: unknown): value is GamePart {
  return value === 'part-1' || value === 'part-2'
}
