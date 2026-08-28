import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  plazaArea: await readFile('src/game/areas/plaza/PlazaArea.tsx', 'utf8'),
  plazaScene: await readFile('src/game/areas/plaza/PlazaScene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/plaza/PlazaInteractionSystem.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/plaza/plazaColliders.ts', 'utf8'),
  busEvents: await readFile('src/game/areas/bus/BusEventDirector.tsx', 'utf8'),
  busInteractions: await readFile('src/game/areas/bus/BusInteractionSystem.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m20.mjs && node scripts/acceptance-m21.mjs')) {
  throw new Error('M21 must preserve M1-M20 acceptance and append M21')
}

if (
  !files.areaTypes.includes("area: 'meridian-plaza'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'plaza-arrival'") ||
  !files.areaDirector.includes("area === 'meridian-plaza'") ||
  !files.areaDirector.includes('<PlazaArea') ||
  !files.areaDirector.includes("area !== 'meridian-plaza'")
) {
  throw new Error('M21 streamed Meridian Plaza contract is missing')
}

if (
  !files.plazaArea.includes('<PbrEnvironment />') ||
  !files.plazaArea.includes('<PlazaScene />') ||
  !files.plazaArea.includes('<StreetRain />') ||
  !files.plazaArea.includes('<StreetAudio />') ||
  !files.plazaArea.includes('<TrueFirstPersonBody') ||
  !files.plazaArea.includes('<PlayerController colliders={PLAZA_COLLIDERS}') ||
  !files.plazaArea.includes('<PostEffects />')
) {
  throw new Error('M21 true-first-person/PBR plaza runtime contract is missing')
}

for (const id of ['lobby-door', 'tower-sign', 'security-notice']) {
  if (!files.plazaScene.includes(`plazaInteractableId: '${id}'`)) {
    throw new Error(`M21 plaza interactable missing: ${id}`)
  }
}

if (
  !files.interactions.includes("objectId: `plaza:${id}`") ||
  !files.interactions.includes("setFlag('plaza_entered_tower')") ||
  !files.interactions.includes("'lobby'") ||
  !files.interactions.includes("'lobby-entry'") ||
  !files.interactions.includes("'door-handle'") ||
  !files.interactions.includes('CORVUS FACILITIES — Procedimento 06-B.')
) {
  throw new Error('M21 interaction/narrative/telemetry contract is missing')
}

if (
  !files.plazaArea.includes("location.checkpoint === 'plaza-missed-stop'") ||
  !files.plazaArea.includes("setFlag('plaza_arrival_seen')") ||
  !files.plazaArea.includes('setCheckpoint') ||
  !files.busEvents.includes("'plaza-missed-stop'") ||
  !files.busInteractions.includes("'plaza-arrival'")
) {
  throw new Error('M21 normal/missed-stop checkpoint continuity contract is missing')
}

if (!files.colliders.includes('PLAZA_COLLIDERS')) {
  throw new Error('M21 plaza collision contract is missing')
}

console.log('M21 Meridian Plaza acceptance passed')
