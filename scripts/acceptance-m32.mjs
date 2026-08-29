import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  director: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  stair: await readFile('src/game/areas/stairwell/StairwellInteractionSystem.tsx', 'utf8'),
  area: await readFile('src/game/areas/security/SecurityCenterArea.tsx', 'utf8'),
  scene: await readFile('src/game/areas/security/SecurityCenterScene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/security/SecurityCenterInteractionSystem.tsx', 'utf8'),
  audio: await readFile('src/game/areas/security/SecurityCenterAudio.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/security/securityCenterColliders.ts', 'utf8'),
  store: await readFile('src/game/state/gameStore.ts', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  model: await readFile('server/models/Save.js', 'utf8'),
}

if (!files.package.includes('acceptance-m31.mjs && node scripts/acceptance-m32.mjs')) throw new Error('M32 must append to full acceptance chain')
if (!files.areaTypes.includes("| 'security-center'") || !files.areaTypes.includes("chapter: 'part-3-security-center'")) throw new Error('Security center area definition missing')
if (!files.director.includes("area === 'security-center'") || !files.director.includes('<SecurityCenterArea')) throw new Error('Security center streaming missing')
if (!files.stair.includes("requestAreaTransition('security-center'") || !files.stair.includes("'security-center-entry'")) throw new Error('39th floor handoff missing')
if (!files.area.includes('<TrueFirstPersonBody') || !files.area.includes('<PlayerController colliders={SECURITY_CENTER_COLLIDERS}') || !files.area.includes('<PostEffects />')) throw new Error('True first-person security center runtime incomplete')
if (!files.scene.includes('Array.from({ length: 9 }') || !files.scene.includes("securityInteractableId: 'cam-02'") || !files.scene.includes("securityInteractableId: 'fire-override'") || !files.scene.includes("securityInteractableId: 'terminal-locked'")) throw new Error('Security center physical scene incomplete')
for (const flag of ['operator_gone','clock_mismatch','cam02_checked','observed_first','alarm_amp_cut','all_doors_released']) {
  if (!files.interactions.includes(`setFlag('${flag}')`)) throw new Error(`Missing M32 flag: ${flag}`)
}
if (!files.interactions.includes('CAM 02 — LOBBY — 23:52:07') || !files.interactions.includes('Cinco minutos. Quem tá mentindo?') || !files.interactions.includes("adjustBpm(25)")) throw new Error('CAM02/clock mismatch/observation contract incomplete')
if (!files.interactions.includes('HOLD_MS = 2000') || !files.interactions.includes("new Event('security:override-alarm')") || !files.audio.includes('context.currentTime + 2')) throw new Error('Two-second global override alarm contract missing')
if (!files.scene.includes("index === 6 && observationActive") || !files.scene.includes('window.addEventListener(\'security:observation\'')) throw new Error('Observation #1 one-second monitor event missing')
if (!files.interactions.includes("setFlag('schedule_scratched')") || !files.interactions.includes("setFlag('migration_incomplete')") || !files.interactions.includes("setFlag('security_radio_checked')")) throw new Error('Optional security evidence missing')
if (!files.store.includes("case 'security-center':") || !files.store.includes('all_doors_released') || !files.store.includes('observed_first')) throw new Error('Security center reload objective missing')
if (!files.server.includes("'security-center'") || !files.model.includes("'security-center'")) throw new Error('Security center persistence missing')
if (!files.colliders.includes('SECURITY_CENTER_COLLIDERS')) throw new Error('Security center collision contract missing')
if (!files.audio.includes('AudioContext') || !files.audio.includes('audioEngine.isMuted()')) throw new Error('Procedural security center audio missing')
if (!files.interactions.includes('subtitleQueue.length > 0') || !files.interactions.includes('dismissSubtitle')) throw new Error('Dialogue serialization regression')

console.log('M32 Security Center acceptance passed')
