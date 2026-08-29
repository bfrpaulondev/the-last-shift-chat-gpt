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
  !files.areaTypes.includes("part: 'part-3'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'knocked-out'") ||
  !files.areaDirector.includes("area === 'blackout'") ||
  !files.areaDirector.includes('<BlackoutArea')
) {
  throw new Error('M29/M31 canonical streamed awakening contract is missing')
}

if (
  !files.floor37Blackout.includes("'blackout'") ||
  !files.floor37Blackout.includes("'knocked-out'") ||
  !files.floor37Blackout.includes('floor37_blackout_triggered')
) {
  throw new Error('M28 reload-safe knockout handoff must remain intact')
}

if (
  !files.recovery.includes("setFlag('knocked_out')") ||
  !files.recovery.includes("setFlag('badge_stolen')") ||
  !files.recovery.includes("setFlag('cup_missing')") ||
  !files.recovery.includes("setCheckpoint('awakening-unconscious'") ||
  !files.recovery.includes("setFlag('blackout_vision_returned')") ||
  !files.recovery.includes("setBpm(128)")
) {
  throw new Error('Canonical awakening/reload contract is missing')
}

if (
  !files.area.includes('<PbrEnvironment />') ||
  !files.area.includes('<TrueFirstPersonBody') ||
  !files.area.includes('<PlayerController colliders={BLACKOUT_COLLIDERS}') ||
  !files.area.includes('<PostEffects />')
) {
  throw new Error('True First Person awakening runtime contract is missing')
}

for (const id of ['shadow-note', 'phone-37', 'fallen-bucket', 'ceo-door-night', 'door37-reader', 'emergency-route-door']) {
  if (!files.scene.includes(`blackoutInteractableId: '${id}'`)) {
    throw new Error(`Canonical awakening interactable missing: ${id}`)
  }
}

if (
  files.scene.includes("blackoutInteractableId: 'emergency-light'") ||
  files.scene.includes("blackoutInteractableId: 'elevator-panel'")
) {
  throw new Error('Superseded generic M29 corridor must not remain active')
}

if (!files.colliders.includes('BLACKOUT_COLLIDERS') || !files.audio.includes('3997') || !files.audio.includes('4003')) {
  throw new Error('Awakening physical/audio contract is missing')
}

if (!files.interactions.includes('subtitleQueue.length > 0') || !files.interactions.includes('dismissSubtitle')) {
  throw new Error('Dialogue serialization guard must remain intact')
}

if (!files.app.includes('<Part3AnxietyController />')) {
  throw new Error('Part 3 anxiety runtime must be mounted')
}

console.log('M29 canonical awakening compatibility acceptance passed')
