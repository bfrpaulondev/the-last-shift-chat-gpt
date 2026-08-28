import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  floor30Area: await readFile('src/game/areas/floor30/Floor30Area.tsx', 'utf8'),
  floor30Scene: await readFile('src/game/areas/floor30/Floor30Scene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/floor30/Floor30InteractionSystem.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/floor30/floor30Colliders.ts', 'utf8'),
  audio: await readFile('src/game/areas/floor30/Floor30Audio.tsx', 'utf8'),
  elevatorInteractions: await readFile('src/game/areas/elevator/ElevatorInteractionSystem.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m25.mjs && node scripts/acceptance-m26.mjs')) {
  throw new Error('M26 must preserve M1-M25 acceptance and append M26')
}

if (
  !files.areaTypes.includes("area: 'work-floor-30'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'floor-30-arrival'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 4.6") ||
  !files.areaDirector.includes("area === 'work-floor-30'") ||
  !files.areaDirector.includes('<Floor30Area') ||
  !files.areaDirector.includes("area !== 'work-floor-30'")
) {
  throw new Error('M26 streamed floor 30 contract is missing')
}

if (
  !files.floor30Area.includes('<PbrEnvironment />') ||
  !files.floor30Area.includes('<Floor30Scene />') ||
  !files.floor30Area.includes('<Floor30Audio />') ||
  !files.floor30Area.includes('<TrueFirstPersonBody') ||
  !files.floor30Area.includes('<PlayerController colliders={FLOOR30_COLLIDERS}') ||
  !files.floor30Area.includes('<PostEffects />')
) {
  throw new Error('M26 true-first-person/PBR floor 30 runtime contract is missing')
}

for (const id of ['service-sheet', 'supply-station', 'glass-panel', 'elevator-return']) {
  if (!files.floor30Scene.includes(`floor30InteractableId: '${id}'`)) {
    throw new Error(`M26 floor 30 interactable missing: ${id}`)
  }
}

if (
  !files.interactions.includes("objectId: `floor30:${id}`") ||
  !files.interactions.includes("setFlag('floor30_service_sheet_read')") ||
  !files.interactions.includes("setFlag('floor30_station_restocked')") ||
  !files.interactions.includes("setFlag('floor30_glass_cleaned')") ||
  !files.interactions.includes("setFlag('floor30_routine_complete')") ||
  !files.interactions.includes("setCheckpoint('floor-30-routine'") ||
  !files.interactions.includes("setCheckpoint('floor-30-complete'") ||
  !files.interactions.includes("setFlag('floor30_left_for_elevator')") ||
  !files.interactions.includes("'service-elevator'") ||
  !files.interactions.includes("'elevator-after-floor-30'")
) {
  throw new Error('M26 floor 30 routine/persistence contract is missing')
}

if (
  !files.elevatorInteractions.includes("'work-floor-30'") ||
  !files.elevatorInteractions.includes("'floor-30-arrival'") ||
  !files.floor30Area.includes("setFlag('floor30_entry_seen')") ||
  !files.floor30Area.includes('setCheckpoint')
) {
  throw new Error('M26 elevator-to-floor30 continuity contract is missing')
}

if (!files.colliders.includes('FLOOR30_COLLIDERS') || !files.colliders.includes("../../physics/colliders")) {
  throw new Error('M26 floor 30 collision contract is missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('createOscillator')
) {
  throw new Error('M26 procedural floor 30 audio contract is missing')
}

if (!files.interactions.includes('subtitleQueue.length > 0') || !files.interactions.includes('dismissSubtitle')) {
  throw new Error('M26 dialogue serialization guard is missing')
}

console.log('M26 Floor 30 Routine acceptance passed')
