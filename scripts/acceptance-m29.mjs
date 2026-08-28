import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  app: await readFile('src/App.tsx', 'utf8'),
  area: await readFile('src/game/areas/blackout/BlackoutArea.tsx', 'utf8'),
  scene: await readFile('src/game/areas/blackout/BlackoutScene.tsx', 'utf8'),
  recovery: await readFile('src/game/areas/blackout/BlackoutRecoveryController.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/blackout/BlackoutInteractionSystem.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/blackout/blackoutColliders.ts', 'utf8'),
  audio: await readFile('src/game/areas/blackout/BlackoutAudio.tsx', 'utf8'),
  floor37Blackout: await readFile('src/game/areas/floor37/Floor37BlackoutController.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m28.mjs && node scripts/acceptance-m29.mjs')) {
  throw new Error('M29 must preserve M1-M28 acceptance and append M29')
}

if (
  !files.areaTypes.includes("area: 'blackout'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'knocked-out'") ||
  !files.areaTypes.includes('defaultSpawn: { x: 0, y: 0.72, z: 2.2') ||
  !files.areaDirector.includes("area === 'blackout'") ||
  !files.areaDirector.includes('<BlackoutArea') ||
  !files.areaDirector.includes("area !== 'blackout'")
) {
  throw new Error('M29 streamed blackout area contract is missing')
}

if (
  !files.area.includes('<BlackoutScene />') ||
  !files.area.includes('<BlackoutAudio />') ||
  !files.area.includes('<BlackoutRecoveryController />') ||
  !files.area.includes('<TrueFirstPersonBody') ||
  !files.area.includes('<PlayerController colliders={BLACKOUT_COLLIDERS}') ||
  !files.area.includes('<PostEffects />')
) {
  throw new Error('M29 true-first-person blackout runtime contract is missing')
}

for (const id of ['brace-point', 'emergency-light', 'elevator-panel', 'fire-door']) {
  if (!files.scene.includes(`blackoutInteractableId: '${id}'`)) {
    throw new Error(`M29 blackout interactable missing: ${id}`)
  }
}

if (
  !files.recovery.includes("setFlag('blackout_recovery_started')") ||
  !files.recovery.includes("setCheckpoint('blackout-unconscious'") ||
  !files.recovery.includes("setFlag('blackout_vision_returned')") ||
  !files.recovery.includes("setCheckpoint('blackout-waking'") ||
  !files.recovery.includes('setBlackout(false)') ||
  !files.recovery.includes('restoreRecoveryObjective')
) {
  throw new Error('M29 persistent wake/reload recovery contract is missing')
}

if (
  !files.interactions.includes("objectId: `blackout:${id}`") ||
  !files.interactions.includes("setFlag('blackout_stood_up')") ||
  !files.interactions.includes("setCheckpoint('blackout-standing'") ||
  !files.interactions.includes("setFlag('blackout_emergency_light_on')") ||
  !files.interactions.includes("setCheckpoint('blackout-emergency-light'") ||
  !files.interactions.includes("setFlag('blackout_elevator_checked')") ||
  !files.interactions.includes("setCheckpoint('blackout-elevator-dead'") ||
  !files.interactions.includes("setFlag('blackout_fire_door_reached')") ||
  !files.interactions.includes("setFlag('blackout_recovery_complete')") ||
  !files.interactions.includes("setCheckpoint('blackout-recovered'")
) {
  throw new Error('M29 recovery progression/persistence contract is missing')
}

if (
  !files.floor37Blackout.includes("'blackout'") ||
  !files.floor37Blackout.includes("'knocked-out'") ||
  !files.floor37Blackout.includes('floor37_blackout_triggered')
) {
  throw new Error('M29 must preserve M28 reload-safe blackout handoff')
}

if (
  !files.app.includes('const blackout = useGameStore') ||
  !files.app.includes('!blackout &&') ||
  !files.area.includes('!blackout && (')
) {
  throw new Error('M29 pointer-lock recovery after vision return is missing')
}

if (!files.colliders.includes('BLACKOUT_COLLIDERS') || !files.colliders.includes("../../physics/colliders")) {
  throw new Error('M29 blackout collision contract is missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('createOscillator') ||
  !files.audio.includes('emergencyLightOn')
) {
  throw new Error('M29 procedural blackout audio contract is missing')
}

if (
  !files.interactions.includes('subtitleQueue.length > 0') ||
  !files.interactions.includes('dismissSubtitle')
) {
  throw new Error('M29 dialogue serialization guard is missing')
}

console.log('M29 Blackout Recovery acceptance passed')
