import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  elevatorArea: await readFile('src/game/areas/elevator/ElevatorArea.tsx', 'utf8'),
  elevatorScene: await readFile('src/game/areas/elevator/ElevatorScene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/elevator/ElevatorInteractionSystem.tsx', 'utf8'),
  ride: await readFile('src/game/areas/elevator/ElevatorRideController.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/elevator/elevatorColliders.ts', 'utf8'),
  audio: await readFile('src/game/areas/elevator/ElevatorAudio.tsx', 'utf8'),
  lockerInteractions: await readFile('src/game/areas/locker/LockerInteractionSystem.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m23.mjs && node scripts/acceptance-m24.mjs')) {
  throw new Error('M24 must preserve M1-M23 acceptance and append M24')
}

if (
  !files.areaTypes.includes("area: 'service-elevator'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'elevator-cabin'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 1.2") ||
  !files.areaDirector.includes("area === 'service-elevator'") ||
  !files.areaDirector.includes('<ElevatorArea') ||
  !files.areaDirector.includes("area !== 'service-elevator'")
) {
  throw new Error('M24 streamed service elevator contract is missing')
}

if (
  !files.elevatorArea.includes('<PbrEnvironment />') ||
  !files.elevatorArea.includes('<ElevatorScene />') ||
  !files.elevatorArea.includes('<ElevatorAudio />') ||
  !files.elevatorArea.includes('<ElevatorRideController />') ||
  !files.elevatorArea.includes('<TrueFirstPersonBody') ||
  !files.elevatorArea.includes('<PlayerController colliders={ELEVATOR_COLLIDERS}') ||
  !files.elevatorArea.includes('<PostEffects />')
) {
  throw new Error('M24 true-first-person/PBR elevator runtime contract is missing')
}

for (const id of ['floor-22-button', 'service-notice', 'doors']) {
  if (!files.elevatorScene.includes(`elevatorInteractableId: '${id}'`)) {
    throw new Error(`M24 elevator interactable missing: ${id}`)
  }
}

if (
  !files.interactions.includes("objectId: `elevator:${id}`") ||
  !files.interactions.includes("setFlag('elevator_ride_started')") ||
  !files.interactions.includes("setCheckpoint('elevator-ascending'") ||
  !files.interactions.includes("setFlag('elevator_left_for_floor_22')") ||
  !files.interactions.includes("'work-floor-22'") ||
  !files.interactions.includes("'floor-22-arrival'") ||
  !files.interactions.includes("game.flags.locker_uniform_on") ||
  !files.interactions.includes("game.flags.locker_route_confirmed") ||
  !files.interactions.includes("'press'") ||
  !files.interactions.includes("'door-handle'")
) {
  throw new Error('M24 controls/gating/floor transition contract is missing')
}

if (
  !files.ride.includes("setFlag('elevator_arrived_22')") ||
  !files.ride.includes("setCheckpoint('elevator-floor-22'") ||
  !files.ride.includes('window.setTimeout') ||
  !files.ride.includes("location.area !== 'service-elevator'")
) {
  throw new Error('M24 persistent elevator ride completion contract is missing')
}

if (
  !files.lockerInteractions.includes("'service-elevator'") ||
  !files.lockerInteractions.includes("'elevator-cabin'") ||
  !files.elevatorArea.includes("setFlag('elevator_entry_seen')") ||
  !files.elevatorArea.includes('setCheckpoint')
) {
  throw new Error('M24 M23-to-elevator checkpoint continuity contract is missing')
}

if (!files.colliders.includes('ELEVATOR_COLLIDERS')) {
  throw new Error('M24 elevator collision contract is missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('createOscillator') ||
  !files.audio.includes('elevator_arrived_22')
) {
  throw new Error('M24 procedural elevator audio contract is missing')
}

console.log('M24 Service Elevator acceptance passed')
