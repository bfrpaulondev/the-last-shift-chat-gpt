import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  director: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  stair: await readFile('src/game/areas/stairwell/StairwellInteractionSystem.tsx', 'utf8'),
  area: await readFile('src/game/areas/security/SecurityCenterArea.tsx', 'utf8'),
  scene: await readFile('src/game/areas/security/SecurityCenterScene.tsx', 'utf8'),
  camera: await readFile('src/game/areas/security/SecurityCameraFeed.tsx', 'utf8'),
  observation: await readFile('src/game/areas/security/SecurityObservationMonitor.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/security/SecurityCenterInteractionSystem.tsx', 'utf8'),
  audio: await readFile('src/game/areas/security/SecurityCenterAudio.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/security/securityCenterColliders.ts', 'utf8'),
  store: await readFile('src/game/state/gameStore.ts', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  model: await readFile('server/models/Save.js', 'utf8'),
}

if (!files.package.includes('acceptance-m31.mjs && node scripts/acceptance-m32.mjs')) {
  throw new Error('M32 must append to full acceptance chain')
}

if (
  !files.areaTypes.includes("| 'security-center'") ||
  !files.areaTypes.includes("chapter: 'part-3-security-center'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'security-center-entry'")
) {
  throw new Error('Security center area definition missing')
}

if (
  !files.director.includes("area === 'security-center'") ||
  !files.director.includes('<SecurityCenterArea') ||
  !files.stair.includes("'security-center'") ||
  !files.stair.includes("'security-center-entry'")
) {
  throw new Error('39th floor to security center streaming handoff missing')
}

if (
  !files.area.includes('<SecurityCenterScene />') ||
  !files.area.includes('<TrueFirstPersonBody') ||
  !files.area.includes('<PlayerController colliders={SECURITY_CENTER_COLLIDERS}') ||
  !files.area.includes('<PostEffects />')
) {
  throw new Error('True first-person security center runtime incomplete')
}

if (
  !files.scene.includes('<SecurityCameraFeed />') ||
  !files.scene.includes('<SecurityObservationMonitor />') ||
  !files.scene.includes('OperatorChair') ||
  !files.scene.includes('CoffeeSteam') ||
  !files.scene.includes("securityInteractableId: 'fireman-override'") ||
  !files.scene.includes("securityInteractableId: 'radio-base'") ||
  !files.scene.includes("securityInteractableId: 'terminal-main'") ||
  !files.scene.includes("securityInteractableId: 'schedule'") ||
  !files.scene.includes("securityInteractableId: 'migration-checklist'")
) {
  throw new Error('Security center physical scene incomplete')
}

if (
  !files.camera.includes('useFBO(512, 288') ||
  !files.camera.includes('CAM 02 — LOBBY') ||
  !files.camera.includes('23:52:07') ||
  !files.camera.includes("setFlag('clock_mismatch')") ||
  !files.camera.includes("setFlag('cam02_view_closed')") ||
  !files.camera.includes("setFlag('cam02_zoomed_nascimento')") ||
  !files.camera.includes('Cinco minutos. Quem tá mentindo?')
) {
  throw new Error('Real CAM02 render target/clock mismatch/zoom contract incomplete')
}

if (
  !files.observation.includes("setPhase('figure')") ||
  !files.observation.includes("setPhase('static')") ||
  !files.observation.includes('}, 650)') ||
  !files.observation.includes('}, 1650)') ||
  !files.observation.includes('adjustBpm(25)') ||
  !files.observation.includes("setFlag('observed_first')") ||
  !files.observation.includes("new Event('security:observation-sting')")
) {
  throw new Error('Observation #1 one-second figure to static sequence missing')
}

for (const flag of ['cam02_checked', 'alarm_amp_cut', 'all_doors_released']) {
  if (!files.interactions.includes(`setFlag('${flag}')`)) {
    throw new Error(`Missing M32 interaction flag: ${flag}`)
  }
}

if (
  !files.area.includes("setFlag('operator_gone')") ||
  !files.interactions.includes('HOLD_MS = 2000') ||
  !files.interactions.includes('overrideHolding') ||
  !files.interactions.includes("new Event('security:override-start')") ||
  !files.interactions.includes("new Event('security:override-cancel')") ||
  !files.interactions.includes("new Event('security:override-complete')") ||
  !files.interactions.includes('AUDIO AMP: DISCONNECTED — MANUAL CUT')
) {
  throw new Error('Canonical hold-to-override progression incomplete')
}

if (
  !files.audio.includes("security:override-start") ||
  !files.audio.includes("security:override-cancel") ||
  !files.audio.includes("security:override-complete") ||
  !files.audio.includes('now + 1.999') ||
  !files.audio.includes('now + 2)')
) {
  throw new Error('Override siren must run for two seconds and support early cancellation')
}

if (
  !files.interactions.includes("setFlag('schedule_scratched')") ||
  !files.interactions.includes("setFlag('migration_incomplete')") ||
  !files.interactions.includes("setFlag('security_radio_checked')") ||
  !files.audio.includes("security:radio-static")
) {
  throw new Error('Optional security evidence/audio missing')
}

if (
  !files.store.includes("case 'security-center':") ||
  !files.store.includes('all_doors_released') ||
  !files.store.includes('observed_first') ||
  !files.server.includes("'security-center'") ||
  !files.model.includes("'security-center'")
) {
  throw new Error('Security center reload/persistence contract missing')
}

if (!files.colliders.includes('SECURITY_CENTER_COLLIDERS')) {
  throw new Error('Security center collision contract missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.interactions.includes('subtitleQueue.length > 0') ||
  !files.interactions.includes('dismissSubtitle')
) {
  throw new Error('Procedural audio or dialogue serialization regression')
}

console.log('M32 Security Center acceptance passed')
