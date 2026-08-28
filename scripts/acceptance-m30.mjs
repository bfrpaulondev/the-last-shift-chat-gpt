import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  gameStore: await readFile('src/game/state/gameStore.ts', 'utf8'),
  blackoutInteractions: await readFile('src/game/areas/blackout/BlackoutInteractionSystem.tsx', 'utf8'),
  stairArea: await readFile('src/game/areas/stairwell/StairwellArea.tsx', 'utf8'),
  stairScene: await readFile('src/game/areas/stairwell/StairwellScene.tsx', 'utf8'),
  stairInteractions: await readFile('src/game/areas/stairwell/StairwellInteractionSystem.tsx', 'utf8'),
  stairAudio: await readFile('src/game/areas/stairwell/StairwellAudio.tsx', 'utf8'),
  stairColliders: await readFile('src/game/areas/stairwell/stairwellColliders.ts', 'utf8'),
  m29: await readFile('scripts/acceptance-m29.mjs', 'utf8'),
}

if (!files.package.includes('acceptance-m29.mjs && node scripts/acceptance-m30.mjs')) {
  throw new Error('M30 must preserve M1-M29 acceptance and append M30')
}

if (!files.m29.includes('M29')) {
  throw new Error('M30 must preserve the M29 blackout recovery acceptance contract')
}

if (
  !files.areaTypes.includes("| 'emergency-stairwell'") ||
  !files.areaTypes.includes("area: 'emergency-stairwell'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'stairwell-entry'") ||
  !files.areaTypes.includes("chapter: 'part-2-emergency-route'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 4.8")
) {
  throw new Error('M30 emergency stairwell area definition is missing')
}

if (
  !files.areaDirector.includes("area === 'emergency-stairwell'") ||
  !files.areaDirector.includes('<StairwellArea') ||
  !files.areaDirector.includes("area !== 'emergency-stairwell'")
) {
  throw new Error('M30 streamed stairwell runtime contract is missing')
}

if (
  !files.blackoutInteractions.includes("setFlag('blackout_left_for_stairwell')") ||
  !files.blackoutInteractions.includes("'emergency-stairwell'") ||
  !files.blackoutInteractions.includes("'stairwell-entry'") ||
  !files.blackoutInteractions.includes("game.flags.blackout_elevator_checked")
) {
  throw new Error('M30 M29 fire-door handoff contract is missing')
}

if (
  !files.stairArea.includes('<PbrEnvironment />') ||
  !files.stairArea.includes('<StairwellScene />') ||
  !files.stairArea.includes('<StairwellAudio />') ||
  !files.stairArea.includes('<TrueFirstPersonBody') ||
  !files.stairArea.includes('<PlayerController colliders={STAIRWELL_COLLIDERS}') ||
  !files.stairArea.includes('<PostEffects />')
) {
  throw new Error('M30 True First Person/PBR stairwell contract is missing')
}

for (const id of ['emergency-plan', 'upper-descent', 'emergency-phone', 'lower-descent']) {
  if (!files.stairScene.includes(`stairwellInteractableId: '${id}'`)) {
    throw new Error(`M30 stairwell interactable missing: ${id}`)
  }
}

if (
  !files.stairInteractions.includes("objectId: `stairwell:${id}`") ||
  !files.stairInteractions.includes("setFlag('stairwell_plan_read')") ||
  !files.stairInteractions.includes("setFlag('stairwell_first_descent')") ||
  !files.stairInteractions.includes("setCheckpoint('stairwell-lower-landing'") ||
  !files.stairInteractions.includes("setFlag('stairwell_phone_checked')") ||
  !files.stairInteractions.includes("setCheckpoint('stairwell-phone-dead'") ||
  !files.stairInteractions.includes("setFlag('stairwell_route_complete')") ||
  !files.stairInteractions.includes("setCheckpoint('stairwell-route-ready'") ||
  !files.stairInteractions.includes("'phone-lift'") ||
  !files.stairInteractions.includes("'door-handle'")
) {
  throw new Error('M30 stairwell interaction/persistence contract is missing')
}

if (
  !files.stairInteractions.includes("requestAreaTransition(") ||
  !files.stairInteractions.includes("'emergency-stairwell'") ||
  !files.stairInteractions.includes("'stairwell-lower-landing'")
) {
  throw new Error('M30 cinematic lower-landing transition contract is missing')
}

if (
  !files.gameStore.includes("case 'emergency-stairwell':") ||
  !files.gameStore.includes('stairwell_route_complete') ||
  !files.gameStore.includes('stairwell_phone_checked') ||
  !files.gameStore.includes('stairwell_first_descent')
) {
  throw new Error('M30 reload-safe emergency-route objective contract is missing')
}

if (!files.stairColliders.includes('STAIRWELL_COLLIDERS') || !files.stairColliders.includes("../../physics/colliders")) {
  throw new Error('M30 stairwell collision contract is missing')
}

if (
  !files.stairAudio.includes('AudioContext') ||
  !files.stairAudio.includes('audioEngine.isMuted()') ||
  !files.stairAudio.includes('createOscillator')
) {
  throw new Error('M30 procedural stairwell audio contract is missing')
}

if (!files.stairInteractions.includes('subtitleQueue.length > 0') || !files.stairInteractions.includes('dismissSubtitle')) {
  throw new Error('M30 dialogue serialization guard is missing')
}

console.log('M30 Emergency Stairwell acceptance passed')
