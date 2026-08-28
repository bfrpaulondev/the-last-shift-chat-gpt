import { readFile } from 'node:fs/promises'

const files = {
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  streetArea: await readFile('src/game/areas/street/StreetArea.tsx', 'utf8'),
  streetScene: await readFile('src/game/areas/street/StreetScene.tsx', 'utf8'),
  streetRain: await readFile('src/game/areas/street/StreetRain.tsx', 'utf8'),
  streetInteractions: await readFile('src/game/areas/street/StreetInteractionSystem.tsx', 'utf8'),
  streetAudio: await readFile('src/game/areas/street/StreetAudio.tsx', 'utf8'),
  streetTextures: await readFile('src/game/areas/street/streetTextures.ts', 'utf8'),
  streetColliders: await readFile('src/game/areas/street/streetColliders.ts', 'utf8'),
  app: await readFile('src/App.tsx', 'utf8'),
  shiftClock: await readFile('src/game/time/shiftClock.ts', 'utf8'),
  shiftController: await readFile('src/game/time/ShiftClockController.tsx', 'utf8'),
  gameClock: await readFile('src/game/ui/GameClock.tsx', 'utf8'),
  persistence: await readFile('src/game/api/PersistenceManager.tsx', 'utf8'),
  gameApi: await readFile('src/game/api/gameApi.ts', 'utf8'),
  saveModel: await readFile('server/models/Save.js', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  smoke: await readFile('server/smoke.js', 'utf8'),
}

if (
  !files.areaDirector.includes("area === 'street'") ||
  !files.areaDirector.includes('<StreetArea')
) {
  throw new Error('M19 street area is not mounted through AreaDirector')
}

if (
  !files.streetScene.includes('function BusShelter()') ||
  !files.streetScene.includes('function MeridianTower()') ||
  !files.streetScene.includes('function BackgroundCity()') ||
  !files.streetScene.includes('function Bus214()') ||
  !files.streetScene.includes('function SignatureFluorescent()') ||
  !files.streetScene.includes("streetInteractableId: 'route-214'") ||
  !files.streetScene.includes("streetInteractableId: 'corvus-flyer'") ||
  !files.streetScene.includes("streetInteractableId: 'tower-puddle'") ||
  !files.streetScene.includes("streetInteractableId: 'bus-door'")
) {
  throw new Error('M19 street narrative environment contract is missing')
}

if (
  !files.streetRain.includes('const DROP_COUNT = 520') ||
  !files.streetRain.includes('<instancedMesh') ||
  !files.streetRain.includes('instanceMatrix.needsUpdate = true')
) {
  throw new Error('M19 optimized street rain contract is missing')
}

if (
  !files.streetTextures.includes('createPortuguesePavementTexture') ||
  !files.streetTextures.includes('createRoute214Texture') ||
  !files.streetTextures.includes('createCorvusFlyerTexture') ||
  !files.streetTextures.includes('06:05') ||
  !files.streetTextures.includes('CORVUS')
) {
  throw new Error('M19 procedural street prop texture contract is missing')
}

if (
  !files.streetInteractions.includes("setFlag('route_214_checked')") ||
  !files.streetInteractions.includes("setFlag('corvus_flyer_seen')") ||
  !files.streetInteractions.includes("setFlag('meridian_puddle_seen')") ||
  !files.streetInteractions.includes("setFlag('bus_boarded')") ||
  !files.streetInteractions.includes("requestAreaTransition(\n            'bus-214'") ||
  !files.streetInteractions.includes('LINHA 214 — BAIRRO NORTE')
) {
  throw new Error('M19 street interaction/boarding contract is missing')
}

if (
  !files.streetArea.includes('<PlayerController colliders={STREET_COLLIDERS}') ||
  !files.streetArea.includes('<TrueFirstPersonBody') ||
  !files.streetArea.includes('<PostEffects />') ||
  !files.streetArea.includes('<StreetAudio />') ||
  !files.streetColliders.includes('STREET_COLLIDERS')
) {
  throw new Error('M19 true-first-person street runtime contract is missing')
}

if (
  !files.streetAudio.includes('rainSource') ||
  !files.streetAudio.includes('roadSource') ||
  !files.streetAudio.includes('bus_arrived') ||
  !files.streetAudio.includes('audioEngine.isMuted()')
) {
  throw new Error('M19 procedural street audio contract is missing')
}

if (
  !files.shiftClock.includes('export const ROUTINE_INTERVAL_MINUTES = 15') ||
  !files.shiftClock.includes('worldMinute % ROUTINE_INTERVAL_MINUTES === 0') ||
  !files.shiftClock.includes('lastRoutineMinute') ||
  !files.shiftController.includes('ROUTINE_AREAS') ||
  !files.shiftController.includes('isRoutineBoundary(targetMinute)') ||
  !files.shiftController.includes('clock.markRoutineMinute(targetMinute)') ||
  !files.gameClock.includes('nextRoutineMinute')
) {
  throw new Error('M19 15-minute routine cadence contract is missing')
}

if (
  !files.persistence.includes('hydrateShiftTime(save.shiftTime)') ||
  !files.persistence.includes('{ worldMinute, lastRoutineMinute }') ||
  !files.gameApi.includes('shiftTime?: ShiftTimeSnapshot') ||
  !files.saveModel.includes('shiftTimeSchema') ||
  !files.server.includes('function isShiftTime') ||
  !files.smoke.includes('lastRoutineMinute: 390')
) {
  throw new Error('M19 persistent shift-time contract is missing')
}

if (
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 1.55, yaw: Math.PI }") ||
  (!files.app.includes("currentArea !== 'blackout'") && !files.app.includes('!blackout &&'))
) {
  throw new Error('M19 post-stream spawn/pointer-lock continuity contract is missing')
}

console.log('M19 street/bus-stop + 15-minute routine acceptance passed')
