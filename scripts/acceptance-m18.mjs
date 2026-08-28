import { readFile } from 'node:fs/promises'

const files = {
  app: await readFile('src/App.tsx', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  transitionOverlay: await readFile('src/game/flow/AreaTransitionOverlay.tsx', 'utf8'),
  store: await readFile('src/game/state/gameStore.ts', 'utf8'),
  persistence: await readFile('src/game/api/PersistenceManager.tsx', 'utf8'),
  gameApi: await readFile('src/game/api/gameApi.ts', 'utf8'),
  saveModel: await readFile('server/models/Save.js', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  smoke: await readFile('server/smoke.js', 'utf8'),
}

for (const area of [
  'apartment',
  'street',
  'bus-214',
  'meridian-plaza',
  'lobby',
  'locker-b1',
  'service-elevator',
  'work-floor-22',
  'work-floor-30',
  'cafeteria',
  'floor-37',
  'blackout',
]) {
  if (!files.areaTypes.includes(`'${area}'`)) {
    throw new Error(`M18 area contract missing: ${area}`)
  }
}

if (
  !files.areaTypes.includes('export const INITIAL_LOCATION') ||
  !files.areaTypes.includes('export function locationForArea') ||
  !files.areaTypes.includes("chapter: 'part-2-road-to-meridian'")
) {
  throw new Error('M18 area metadata contract is missing')
}

if (
  !files.store.includes('location: INITIAL_LOCATION') ||
  !files.store.includes('requestAreaTransition: (area, checkpoint, spawn, durationMs = 900)') ||
  !files.store.includes('areaSwapTimer') ||
  !files.store.includes('hydrateProgress: (flags, location = INITIAL_LOCATION)') ||
  !files.store.includes("current.location.area === 'apartment' && current.flags.left_home") ||
  !files.store.includes("get().requestAreaTransition('street', 'street-arrival'")
) {
  throw new Error('M18 runtime area transition contract is missing')
}

if (
  !files.app.includes('<AreaDirector') ||
  !files.app.includes('<AreaTransitionOverlay />') ||
  !files.areaDirector.includes("area === 'apartment'") ||
  !files.areaDirector.includes('<StreamingStandby') ||
  !files.areaDirector.includes('<AreaCameraSpawn />') ||
  !files.transitionOverlay.includes('element.animate(') ||
  !files.transitionOverlay.includes('transition.durationMs')
) {
  throw new Error('M18 one-area-at-a-time streaming/fade contract is missing')
}

if (
  !files.persistence.includes('const location = useGameStore((state) => state.location)') ||
  !files.persistence.includes('normalizeSaveLocation(save)') ||
  !files.persistence.includes('latestState.location') ||
  !files.gameApi.includes('schemaVersion: 2') ||
  !files.gameApi.includes('AREA_DEFINITIONS[location.area].chapter') ||
  !files.gameApi.includes('export function normalizeSaveLocation') ||
  !files.gameApi.includes('save.flags?.left_home')
) {
  throw new Error('M18 client location persistence/migration contract is missing')
}

if (
  !files.saveModel.includes('const locationSchema') ||
  !files.saveModel.includes("'floor-37'") ||
  !files.saveModel.includes('schemaVersion') ||
  !files.server.includes('function isGameLocation') ||
  !files.server.includes('GAME_AREAS') ||
  !files.server.includes('update.location = location') ||
  !files.smoke.includes("area: 'street'") ||
  !files.smoke.includes("checkpoint: 'street-arrival'") ||
  !files.smoke.includes('save.schemaVersion !== 2')
) {
  throw new Error('M18 backend save-location contract is missing')
}

console.log('M18 area flow/streaming acceptance contract: OK')
