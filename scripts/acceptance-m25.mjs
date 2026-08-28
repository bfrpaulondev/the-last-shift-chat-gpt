import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  floorArea: await readFile('src/game/areas/floor22/Floor22Area.tsx', 'utf8'),
  floorScene: await readFile('src/game/areas/floor22/Floor22Scene.tsx', 'utf8'),
  floorInteractions: await readFile('src/game/areas/floor22/Floor22InteractionSystem.tsx', 'utf8'),
  floorColliders: await readFile('src/game/areas/floor22/floor22Colliders.ts', 'utf8'),
  floorAudio: await readFile('src/game/areas/floor22/Floor22Audio.tsx', 'utf8'),
  elevatorArea: await readFile('src/game/areas/elevator/ElevatorArea.tsx', 'utf8'),
  elevatorScene: await readFile('src/game/areas/elevator/ElevatorScene.tsx', 'utf8'),
  elevatorInteractions: await readFile('src/game/areas/elevator/ElevatorInteractionSystem.tsx', 'utf8'),
  elevatorRide: await readFile('src/game/areas/elevator/ElevatorRideController.tsx', 'utf8'),
  elevatorAudio: await readFile('src/game/areas/elevator/ElevatorAudio.tsx', 'utf8'),
  gameStore: await readFile('src/game/state/gameStore.ts', 'utf8'),
}

if (!files.package.includes('acceptance-m24.mjs && node scripts/acceptance-m25.mjs')) {
  throw new Error('M25 must preserve M1-M24 acceptance and append M25')
}

if (
  !files.areaTypes.includes("area: 'work-floor-22'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'floor-22-arrival'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 6.4") ||
  !files.areaDirector.includes("area === 'work-floor-22'") ||
  !files.areaDirector.includes('<Floor22Area') ||
  !files.areaDirector.includes("area !== 'work-floor-22'")
) {
  throw new Error('M25 streamed floor 22 contract is missing')
}

if (
  !files.floorArea.includes('<PbrEnvironment />') ||
  !files.floorArea.includes('<Floor22Scene />') ||
  !files.floorArea.includes('<Floor22Audio />') ||
  !files.floorArea.includes('<TrueFirstPersonBody') ||
  !files.floorArea.includes('<PlayerController colliders={FLOOR22_COLLIDERS}') ||
  !files.floorArea.includes('<PostEffects />')
) {
  throw new Error('M25 true-first-person/PBR floor runtime contract is missing')
}

for (const id of ['work-order', 'cleaning-cart', 'spill', 'waste-bin', 'elevator-return']) {
  if (!files.floorScene.includes(`floor22InteractableId: '${id}'`)) {
    throw new Error(`M25 floor 22 interactable missing: ${id}`)
  }
}

if (
  !files.floorInteractions.includes("objectId: `floor22:${id}`") ||
  !files.floorInteractions.includes("setFlag('floor22_cart_ready')") ||
  !files.floorInteractions.includes("setFlag('floor22_spill_cleaned')") ||
  !files.floorInteractions.includes("setFlag('floor22_waste_emptied')") ||
  !files.floorInteractions.includes("setFlag('floor22_routine_complete')") ||
  !files.floorInteractions.includes("setCheckpoint('floor-22-routine'") ||
  !files.floorInteractions.includes("setCheckpoint('floor-22-complete'") ||
  !files.floorInteractions.includes("'service-elevator'") ||
  !files.floorInteractions.includes("'elevator-after-floor-22'")
) {
  throw new Error('M25 work routine/persistence/return contract is missing')
}

if (
  !files.floorInteractions.includes('!game.flags.floor22_spill_cleaned') ||
  !files.floorInteractions.includes('!game.flags.floor22_waste_emptied') ||
  !files.floorInteractions.includes('!game.flags.floor22_routine_complete')
) {
  throw new Error('M25 completion gating contract is missing')
}

if (
  !files.elevatorArea.includes("'elevator-after-floor-22'") ||
  !files.elevatorArea.includes("setFlag('elevator_floor22_return_seen')") ||
  !files.elevatorScene.includes("elevatorInteractableId: 'floor-30-button'") ||
  !files.elevatorInteractions.includes("setFlag('elevator_ride_to_30_started')") ||
  !files.elevatorInteractions.includes("setCheckpoint('elevator-ascending-30'") ||
  !files.elevatorRide.includes("setFlag('elevator_arrived_30')") ||
  !files.elevatorRide.includes("setCheckpoint('elevator-floor-30'") ||
  !files.elevatorInteractions.includes("setFlag('elevator_left_for_floor_30')") ||
  !files.elevatorInteractions.includes("'work-floor-30'") ||
  !files.elevatorInteractions.includes("'floor-30-arrival'")
) {
  throw new Error('M25 elevator continuation to floor 30 contract is missing')
}

if (
  !files.elevatorInteractions.includes("setFlag('elevator_ride_started')") ||
  !files.elevatorInteractions.includes("setFlag('elevator_left_for_floor_22')") ||
  !files.elevatorRide.includes("setFlag('elevator_arrived_22')")
) {
  throw new Error('M25 regressed the M24 first elevator ride')
}

if (!files.floorColliders.includes('FLOOR22_COLLIDERS')) {
  throw new Error('M25 floor 22 collision contract is missing')
}

if (
  !files.floorAudio.includes('AudioContext') ||
  !files.floorAudio.includes('audioEngine.isMuted()') ||
  !files.floorAudio.includes('createOscillator') ||
  !files.elevatorAudio.includes('elevator_arrived_22') ||
  !files.elevatorAudio.includes('elevator_arrived_30') ||
  !files.elevatorAudio.includes('elevator_ride_to_30_started')
) {
  throw new Error('M25 procedural area/elevator audio contract is missing')
}

if (
  !files.gameStore.includes('subtitleQueue') ||
  !files.gameStore.includes('current.subtitle !== text') ||
  !files.gameStore.includes('dismissSubtitle')
) {
  throw new Error('M25 dialogue serialization regression detected')
}

console.log('M25 Floor 22 Routine acceptance passed')
