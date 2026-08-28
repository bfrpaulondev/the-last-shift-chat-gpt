import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  cafeteriaArea: await readFile('src/game/areas/cafeteria/CafeteriaArea.tsx', 'utf8'),
  cafeteriaScene: await readFile('src/game/areas/cafeteria/CafeteriaScene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/cafeteria/CafeteriaInteractionSystem.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/cafeteria/cafeteriaColliders.ts', 'utf8'),
  audio: await readFile('src/game/areas/cafeteria/CafeteriaAudio.tsx', 'utf8'),
  elevatorArea: await readFile('src/game/areas/elevator/ElevatorArea.tsx', 'utf8'),
  elevatorScene: await readFile('src/game/areas/elevator/ElevatorScene.tsx', 'utf8'),
  elevatorInteractions: await readFile('src/game/areas/elevator/ElevatorInteractionSystem.tsx', 'utf8'),
  elevatorRide: await readFile('src/game/areas/elevator/ElevatorRideController.tsx', 'utf8'),
  elevatorAudio: await readFile('src/game/areas/elevator/ElevatorAudio.tsx', 'utf8'),
  floor30Interactions: await readFile('src/game/areas/floor30/Floor30InteractionSystem.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m26.mjs && node scripts/acceptance-m27.mjs')) {
  throw new Error('M27 must preserve M1-M26 acceptance and append M27')
}

if (
  !files.areaTypes.includes("area: 'cafeteria'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'cafeteria-arrival'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 5.2") ||
  !files.areaDirector.includes("area === 'cafeteria'") ||
  !files.areaDirector.includes('<CafeteriaArea') ||
  !files.areaDirector.includes("area !== 'cafeteria'")
) {
  throw new Error('M27 streamed cafeteria contract is missing')
}

if (
  !files.cafeteriaArea.includes('<PbrEnvironment />') ||
  !files.cafeteriaArea.includes('<CafeteriaScene />') ||
  !files.cafeteriaArea.includes('<CafeteriaAudio />') ||
  !files.cafeteriaArea.includes('<TrueFirstPersonBody') ||
  !files.cafeteriaArea.includes('<PlayerController colliders={CAFETERIA_COLLIDERS}') ||
  !files.cafeteriaArea.includes('<PostEffects />')
) {
  throw new Error('M27 true-first-person/PBR cafeteria runtime contract is missing')
}

for (const id of ['break-notice', 'coffee-machine', 'break-seat', 'elevator-return']) {
  if (!files.cafeteriaScene.includes(`cafeteriaInteractableId: '${id}'`)) {
    throw new Error(`M27 cafeteria interactable missing: ${id}`)
  }
}

if (
  !files.interactions.includes("objectId: `cafeteria:${id}`") ||
  !files.interactions.includes("setFlag('cafeteria_notice_read')") ||
  !files.interactions.includes("setFlag('cafeteria_coffee_taken')") ||
  !files.interactions.includes("setFlag('cafeteria_break_taken')") ||
  !files.interactions.includes("setFlag('cafeteria_break_complete')") ||
  !files.interactions.includes("setCheckpoint('cafeteria-break'") ||
  !files.interactions.includes("setCheckpoint('cafeteria-complete'") ||
  !files.interactions.includes("setFlag('cafeteria_left_for_elevator')") ||
  !files.interactions.includes("'elevator-after-cafeteria'")
) {
  throw new Error('M27 cafeteria pause/persistence contract is missing')
}

if (
  !files.floor30Interactions.includes("'elevator-after-floor-30'") ||
  !files.elevatorArea.includes("checkpoint === 'elevator-after-floor-30'") ||
  !files.elevatorInteractions.includes("'cafeteria-button'") ||
  !files.elevatorInteractions.includes("setFlag('elevator_ride_to_cafeteria_started')") ||
  !files.elevatorRide.includes("setFlag('elevator_arrived_cafeteria')") ||
  !files.elevatorRide.includes("setCheckpoint('elevator-cafeteria'") ||
  !files.elevatorInteractions.includes("'cafeteria'") ||
  !files.elevatorInteractions.includes("'cafeteria-arrival'")
) {
  throw new Error('M27 floor30-to-cafeteria elevator continuity contract is missing')
}

if (
  !files.elevatorArea.includes("checkpoint === 'elevator-after-cafeteria'") ||
  !files.elevatorScene.includes("elevatorInteractableId: 'floor-37-button'") ||
  !files.elevatorInteractions.includes("setFlag('elevator_ride_to_37_started')") ||
  !files.elevatorRide.includes("setFlag('elevator_arrived_37')") ||
  !files.elevatorRide.includes("setCheckpoint('elevator-floor-37'") ||
  !files.elevatorInteractions.includes("'floor-37'") ||
  !files.elevatorInteractions.includes("'floor-37-arrival'")
) {
  throw new Error('M27 cafeteria-to-floor37 handoff contract is missing')
}

if (!files.colliders.includes('CAFETERIA_COLLIDERS') || !files.colliders.includes("../../physics/colliders")) {
  throw new Error('M27 cafeteria collision contract is missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('createOscillator') ||
  !files.elevatorAudio.includes('elevator_ride_to_cafeteria_started') ||
  !files.elevatorAudio.includes('elevator_ride_to_37_started')
) {
  throw new Error('M27 procedural cafeteria/elevator audio contract is missing')
}

if (!files.interactions.includes('subtitleQueue.length > 0') || !files.interactions.includes('dismissSubtitle')) {
  throw new Error('M27 dialogue serialization guard is missing')
}

console.log('M27 Cafeteria Break acceptance passed')
