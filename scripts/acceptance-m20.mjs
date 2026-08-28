import { readFile } from 'node:fs/promises'

const files = {
  app: await readFile('src/App.tsx', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  busArea: await readFile('src/game/areas/bus/BusArea.tsx', 'utf8'),
  busScene: await readFile('src/game/areas/bus/BusScene.tsx', 'utf8'),
  passengers: await readFile('src/game/areas/bus/BusPassengers.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/bus/BusInteractionSystem.tsx', 'utf8'),
  events: await readFile('src/game/areas/bus/BusEventDirector.tsx', 'utf8'),
  audio: await readFile('src/game/areas/bus/BusAudio.tsx', 'utf8'),
  triageStore: await readFile('src/game/areas/bus/busTriageStore.ts', 'utf8'),
  overlay: await readFile('src/game/areas/bus/BusTriageOverlay.tsx', 'utf8'),
  styles: await readFile('src/game/areas/bus/bus.css', 'utf8'),
  rideMotion: await readFile('src/game/areas/bus/BusRideMotion.tsx', 'utf8'),
  exitDoor: await readFile('src/game/areas/bus/BusExitDoor.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/bus/busColliders.ts', 'utf8'),
  player: await readFile('src/game/player/PlayerController.tsx', 'utf8'),
}

if (
  !files.areaDirector.includes("area === 'bus-214'") ||
  !files.areaDirector.includes('<BusArea') ||
  !files.areaDirector.includes("area !== 'bus-214'")
) {
  throw new Error('M20 bus area streaming contract is missing')
}

if (
  !files.busArea.includes('<BusScene />') ||
  !files.busArea.includes('<BusAudio />') ||
  !files.busArea.includes('<BusEventDirector />') ||
  !files.busArea.includes('<BusInteractionSystem />') ||
  !files.busArea.includes('<TrueFirstPersonBody') ||
  !files.busArea.includes('<PlayerController colliders={BUS_COLLIDERS}') ||
  !files.busArea.includes('speedScale={gameplayTimeScale}') ||
  !files.busArea.includes('<PostEffects />')
) {
  throw new Error('M20 streamed true-first-person bus runtime contract is missing')
}

for (const passengerId of [
  'passenger-book',
  'passenger-paulo',
  'passenger-knitting',
  'passenger-executive',
  'gossip-colleagues',
  'passenger-cap',
]) {
  if (!files.passengers.includes(`id="${passengerId}"`)) {
    throw new Error(`M20 passenger missing: ${passengerId}`)
  }
}

if (
  !files.passengers.includes('function Driver()') ||
  (!files.passengers.includes("role='cap'") && !files.passengers.includes('role="cap"')) ||
  files.passengers.includes('passenger-sleeper')
) {
  throw new Error('M20 NPC budget/behavior contract is missing')
}

if (
  !files.busScene.includes('function WetWindow') ||
  !files.busScene.includes('function MovingCity') ||
  !files.busScene.includes("busInteractableId: 'stop-bell'") ||
  !files.busScene.includes('<BusPassengers />') ||
  !files.exitDoor.includes("busInteractableId: 'bus-exit'")
) {
  throw new Error('M20 moving bus environment contract is missing')
}

if (
  !files.triageStore.includes("triagePhase: 'alert'") ||
  !files.triageStore.includes('gameplayTimeScale: 0.3') ||
  !files.triageStore.includes("pinPhase: 'active'") ||
  !files.triageStore.includes('resolveAlert') ||
  !files.triageStore.includes('resolvePin')
) {
  throw new Error('M20 transient TRIAGEM/PIN state contract is missing')
}

if (
  !files.interactions.includes('const HOLD_SECONDS = 0.8') ||
  !files.interactions.includes("'passenger-book'") ||
  !files.interactions.includes("'passenger-paulo'") ||
  !files.interactions.includes("'passenger-executive'") ||
  !files.interactions.includes("'passenger-cap'") ||
  !files.interactions.includes('[E] SEGURAR — MARCAR') ||
  !files.interactions.includes("setFlag('caught_pickpocket')") ||
  !files.interactions.includes('triage_checked_') ||
  !files.interactions.includes('PADRÃO COMPATÍVEL.') ||
  !files.interactions.includes("setFlag('overheard_corvus')") ||
  !files.interactions.includes("setFlag('stop_requested')") ||
  !files.interactions.includes('bus:triage:') ||
  !files.interactions.includes("'meridian-plaza'")
) {
  throw new Error('M20 TRIAGEM/interactions/telemetry contract is missing')
}

if (
  !files.events.includes('const ALERT_WORLD_MINUTE = 6 * 60 + 14') ||
  !files.events.includes('const PIN_WORLD_MINUTE = 6 * 60 + 20') ||
  !files.events.includes('const ANNOUNCEMENT_WORLD_MINUTE = 6 * 60 + 28') ||
  !files.events.includes('const MERIDIAN_WORLD_MINUTE = 6 * 60 + 30') ||
  !files.events.includes('const ALERT_DURATION_MS = 6000') ||
  !files.events.includes('const PIN_DURATION_MS = 2000') ||
  !files.events.includes('state.flags.bus_alert_started && !state.flags.bus_alert_completed') ||
  !files.events.includes('state.flags.pin_qte_started') ||
  !files.events.includes('event.stopImmediatePropagation()') ||
  !files.events.includes("setFlag('pin_protected')") ||
  !files.events.includes("setFlag('pin_exposed')") ||
  !files.events.includes("setFlag('missed_stop')")
) {
  throw new Error('M20 timed event/resume/PIN contract is missing')
}

if (
  !files.audio.includes("state.triagePhase === 'alert' ? 600 : 12000") ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('gossipGainRef') ||
  !files.rideMotion.includes('bumpPulse')
) {
  throw new Error('M20 bus audio/motion contract is missing')
}

if (
  !files.overlay.includes('ALGO ESTÁ FORA DO PADRÃO.') ||
  !files.overlay.includes('[E] COBRIR A TELA') ||
  !files.overlay.includes('triage-progress-ring') ||
  !files.styles.includes('conic-gradient') ||
  !files.styles.includes('pin-shadow-grow 2s') ||
  !files.app.includes("currentArea === 'bus-214' && <BusTriageOverlay />")
) {
  throw new Error('M20 TRIAGEM/PIN HUD contract is missing')
}

if (
  !files.player.includes('speedScale = 1') ||
  !files.player.includes('THREE.MathUtils.clamp(speedScale, 0.1, 1)') ||
  !files.player.includes('* clampedScale') ||
  !files.colliders.includes('BUS_COLLIDERS')
) {
  throw new Error('M20 time-scale/player collision contract is missing')
}

console.log('M20 bus/TRIAGEM/PIN acceptance passed')
