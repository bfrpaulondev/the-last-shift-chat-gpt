import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  floor37Area: await readFile('src/game/areas/floor37/Floor37Area.tsx', 'utf8'),
  floor37Scene: await readFile('src/game/areas/floor37/Floor37Scene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/floor37/Floor37InteractionSystem.tsx', 'utf8'),
  blackoutController: await readFile('src/game/areas/floor37/Floor37BlackoutController.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/floor37/floor37Colliders.ts', 'utf8'),
  audio: await readFile('src/game/areas/floor37/Floor37Audio.tsx', 'utf8'),
  elevatorInteractions: await readFile('src/game/areas/elevator/ElevatorInteractionSystem.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m27.mjs && node scripts/acceptance-m28.mjs')) {
  throw new Error('M28 must preserve M1-M27 acceptance and append M28')
}

if (
  !files.areaTypes.includes("area: 'floor-37'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'floor-37-arrival'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 4.8") ||
  !files.areaTypes.includes("area: 'blackout'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'knocked-out'") ||
  !files.areaDirector.includes("area === 'floor-37'") ||
  !files.areaDirector.includes('<Floor37Area') ||
  !files.areaDirector.includes("area !== 'floor-37'")
) {
  throw new Error('M28 streamed floor 37 / blackout handoff contract is missing')
}

if (
  !files.floor37Area.includes('<PbrEnvironment />') ||
  !files.floor37Area.includes('<Floor37Scene />') ||
  !files.floor37Area.includes('<Floor37Audio />') ||
  !files.floor37Area.includes('<Floor37BlackoutController />') ||
  !files.floor37Area.includes('<TrueFirstPersonBody') ||
  !files.floor37Area.includes('<PlayerController colliders={FLOOR37_COLLIDERS}') ||
  !files.floor37Area.includes('<PostEffects />')
) {
  throw new Error('M28 true-first-person/PBR floor 37 runtime contract is missing')
}

for (const id of ['final-order', 'supply-cart', 'window-panel', 'waste-bin', 'elevator-call']) {
  if (!files.floor37Scene.includes(`floor37InteractableId: '${id}'`)) {
    throw new Error(`M28 floor 37 interactable missing: ${id}`)
  }
}

if (
  !files.interactions.includes("objectId: `floor37:${id}`") ||
  !files.interactions.includes("setFlag('floor37_final_order_read')") ||
  !files.interactions.includes("setFlag('floor37_supplies_ready')") ||
  !files.interactions.includes("setFlag('floor37_window_cleaned')") ||
  !files.interactions.includes("setFlag('floor37_bin_emptied')") ||
  !files.interactions.includes("setFlag('floor37_routine_complete')") ||
  !files.interactions.includes("setCheckpoint('floor-37-routine'") ||
  !files.interactions.includes("setCheckpoint('floor-37-complete'")
) {
  throw new Error('M28 floor 37 routine/persistence contract is missing')
}

if (
  !files.interactions.includes("setFlag('floor37_elevator_called')") ||
  !files.interactions.includes("setFlag('floor37_blackout_triggered')") ||
  !files.interactions.includes("setCheckpoint('floor-37-blackout'") ||
  !files.interactions.includes('triggerScare(1200)') ||
  !files.interactions.includes('setBlackout(true)') ||
  !files.blackoutController.includes('floor37_blackout_triggered') ||
  !files.blackoutController.includes("location.area !== 'floor-37'") ||
  !files.blackoutController.includes("requestAreaTransition(") ||
  !files.blackoutController.includes("'blackout'") ||
  !files.blackoutController.includes("'knocked-out'")
) {
  throw new Error('M28 reload-safe blackout transition contract is missing')
}

if (
  !files.elevatorInteractions.includes("setFlag('elevator_left_for_floor_37')") ||
  !files.elevatorInteractions.includes("requestAreaTransition('floor-37', 'floor-37-arrival'") ||
  !files.floor37Area.includes("setFlag('floor37_entry_seen')") ||
  !files.floor37Area.includes('setCheckpoint')
) {
  throw new Error('M28 elevator-to-floor37 checkpoint continuity contract is missing')
}

if (!files.colliders.includes('FLOOR37_COLLIDERS') || !files.colliders.includes("../../physics/colliders")) {
  throw new Error('M28 floor 37 collision contract is missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('createOscillator') ||
  !files.audio.includes('floor37_blackout_triggered')
) {
  throw new Error('M28 procedural floor 37 audio contract is missing')
}

if (
  !files.interactions.includes('subtitleQueue.length > 0') ||
  !files.interactions.includes('dismissSubtitle')
) {
  throw new Error('M28 dialogue serialization guard is missing')
}

console.log('M28 Floor 37 Routine acceptance passed')
