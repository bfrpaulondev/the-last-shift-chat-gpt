import { readFile } from 'node:fs/promises'

const files = {
  app: await readFile('src/App.tsx', 'utf8'),
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  transitionOverlay: await readFile('src/game/flow/AreaTransitionOverlay.tsx', 'utf8'),
  apartment: await readFile('src/game/ApartmentSkeleton.tsx', 'utf8'),
  interactions: await readFile('src/game/interaction/InteractionSystem.tsx', 'utf8'),
  streetArea: await readFile('src/game/areas/street/StreetArea.tsx', 'utf8'),
  streetScene: await readFile('src/game/areas/street/StreetScene.tsx', 'utf8'),
  streetInteractions: await readFile('src/game/areas/street/StreetInteractionSystem.tsx', 'utf8'),
  streetColliders: await readFile('src/game/areas/street/streetColliders.ts', 'utf8'),
  streetAudio: await readFile('src/game/areas/street/StreetAudio.tsx', 'utf8'),
  shiftClock: await readFile('src/game/time/shiftClock.ts', 'utf8'),
  shiftController: await readFile('src/game/time/ShiftClockController.tsx', 'utf8'),
  gameClock: await readFile('src/game/ui/GameClock.tsx', 'utf8'),
  persistence: await readFile('src/game/api/PersistenceManager.tsx', 'utf8'),
  gameApi: await readFile('src/game/api/gameApi.ts', 'utf8'),
  saveModel: await readFile('server/models/Save.js', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  smoke: await readFile('server/smoke.js', 'utf8'),
}

if (!files.package.includes('node scripts/acceptance-m19.mjs')) {
  throw new Error('M19 acceptance script is not wired into check:acceptance')
}

if (
  !files.areaTypes.includes("| 'street'") ||
  !files.areaTypes.includes("| 'bus-214'") ||
  !files.areaTypes.includes("| 'meridian-plaza'") ||
  !files.areaTypes.includes("| 'lobby'") ||
  !files.areaTypes.includes("| 'locker-b1'") ||
  !files.areaTypes.includes("| 'service-elevator'") ||
  !files.areaTypes.includes("| 'work-floor-22'") ||
  !files.areaTypes.includes("| 'work-floor-30'") ||
  !files.areaTypes.includes("| 'cafeteria'") ||
  !files.areaTypes.includes("| 'floor-37'") ||
  !files.areaTypes.includes("| 'blackout'")
) {
  throw new Error('M19 Part 2 area vocabulary is incomplete')
}

if (
  !files.areaDirector.includes("area === 'apartment'") ||
  !files.areaDirector.includes("area === 'street'") ||
  !files.areaDirector.includes('<StreamingStandby') ||
  !files.app.includes('<AreaDirector') ||
  !files.app.includes('<AreaTransitionOverlay />')
) {
  throw new Error('M19 area streaming director contract is missing')
}

if (
  !files.apartment.includes('gameStarted={gameStarted}') ||
  !files.interactions.includes("requestAreaTransition('street', 'street-arrival'") ||
  !files.transitionOverlay.includes('areaTransition') ||
  !files.transitionOverlay.includes('transition-progress')
) {
  throw new Error('M19 apartment-to-street handoff contract is missing')
}

if (
  !files.streetArea.includes('<StreetScene />') ||
  !files.streetArea.includes('<StreetAudio />') ||
  !files.streetArea.includes('<StreetInteractionSystem />') ||
  !files.streetArea.includes('<TrueFirstPersonBody') ||
  !files.streetArea.includes('<PlayerController colliders={STREET_COLLIDERS}') ||
  !files.streetScene.includes("streetInteractableId: 'bus-stop-sign'") ||
  !files.streetScene.includes("streetInteractableId: 'route-panel'") ||
  !files.streetScene.includes("streetInteractableId: 'bus-door'")
) {
  throw new Error('M19 playable street/bus-stop contract is missing')
}

if (
  !files.streetInteractions.includes("setFlag('street_route_checked')") ||
  !files.streetInteractions.includes("setFlag('street_bus_boarded')") ||
  !files.streetInteractions.includes("requestAreaTransition('bus-214', 'bus-boarded'") ||
  !files.streetInteractions.includes('subtitleQueue.length > 0') ||
  !files.streetInteractions.includes('dismissSubtitle')
) {
  throw new Error('M19 street interaction/serialization contract is missing')
}

if (
  !files.streetAudio.includes('AudioContext') ||
  !files.streetAudio.includes('audioEngine.isMuted()') ||
  !files.streetColliders.includes('STREET_COLLIDERS')
) {
  throw new Error('M19 street audio/collision contract is missing')
}

if (
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
