import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  gameStore: await readFile('src/game/state/gameStore.ts', 'utf8'),
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

if (!files.m29.includes('canonical awakening compatibility')) {
  throw new Error('M30 must consume the corrected canonical awakening contract')
}

if (
  !files.areaTypes.includes("| 'emergency-stairwell'") ||
  !files.areaTypes.includes("label: 'Escada de Emergência — 37 → 39'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'stairwell-floor-37'") ||
  !files.areaDirector.includes("area === 'emergency-stairwell'") ||
  !files.areaDirector.includes('<StairwellArea')
) {
  throw new Error('Canonical streamed stairwell definition is missing')
}

if (
  !files.stairArea.includes('<PbrEnvironment />') ||
  !files.stairArea.includes('<StairwellScene />') ||
  !files.stairArea.includes('<StairwellAudio />') ||
  !files.stairArea.includes('<TrueFirstPersonBody') ||
  !files.stairArea.includes('<PlayerController colliders={STAIRWELL_COLLIDERS}') ||
  !files.stairArea.includes('<PostEffects />')
) {
  throw new Error('True First Person/PBR stairwell runtime contract is missing')
}

for (const id of ['flight-to-38', 'reader-38', 'flight-to-39', 'door-39']) {
  if (!files.stairScene.includes(`stairwellInteractableId: '${id}'`)) {
    throw new Error(`Canonical stairwell object missing: ${id}`)
  }
}

for (const legacy of ['upper-descent', 'emergency-phone', 'lower-descent']) {
  if (files.stairScene.includes(`stairwellInteractableId: '${legacy}'`)) {
    throw new Error(`Superseded descending M30 object must not remain active: ${legacy}`)
  }
}

if (
  !files.stairScene.includes("setFlag('reader38_green')") ||
  !files.stairScene.includes("checkpoint !== 'stairwell-floor-38'") ||
  !files.stairScene.includes('1920') ||
  !files.stairInteractions.includes("setFlag('stairwell_reached_38')") ||
  !files.stairInteractions.includes("setFlag('stairwell_reached_39')") ||
  !files.stairInteractions.includes("setFlag('sc39_open')") ||
  !files.stairInteractions.includes("'stairwell-floor-39-ready'")
) {
  throw new Error('37→38→39 progression/green-reader/door-39 contract is missing')
}

if (
  !files.gameStore.includes('reader38_green') ||
  !files.gameStore.includes('stairwell_reached_39') ||
  !files.gameStore.includes('sc39_open')
) {
  throw new Error('Reload-safe canonical stairwell objectives are missing')
}

if (
  !files.stairAudio.includes('REVERB_SECONDS = 2.8') ||
  !files.stairAudio.includes('LATE_ECHO_SECONDS = 0.5') ||
  !files.stairAudio.includes("window.addEventListener('game:footstep'")
) {
  throw new Error('Concrete-box 2.8s reverb and deliberately late echo are missing')
}

if (!files.stairColliders.includes('STAIRWELL_COLLIDERS')) {
  throw new Error('Stairwell collision contract is missing')
}

if (!files.stairInteractions.includes('subtitleQueue.length > 0') || !files.stairInteractions.includes('dismissSubtitle')) {
  throw new Error('Dialogue serialization guard is missing')
}

console.log('M30 canonical stairwell compatibility acceptance passed')
