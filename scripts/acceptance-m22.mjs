import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  lobbyArea: await readFile('src/game/areas/lobby/LobbyArea.tsx', 'utf8'),
  lobbyScene: await readFile('src/game/areas/lobby/LobbyScene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/lobby/LobbyInteractionSystem.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/lobby/lobbyColliders.ts', 'utf8'),
  audio: await readFile('src/game/areas/lobby/LobbyAudio.tsx', 'utf8'),
  plazaInteractions: await readFile('src/game/areas/plaza/PlazaInteractionSystem.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m21.mjs && node scripts/acceptance-m22.mjs')) {
  throw new Error('M22 must preserve M1-M21 acceptance and append M22')
}

if (
  !files.areaTypes.includes("area: 'lobby'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'lobby-entry'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 4.8") ||
  !files.areaDirector.includes("area === 'lobby'") ||
  !files.areaDirector.includes('<LobbyArea') ||
  !files.areaDirector.includes("area !== 'lobby'")
) {
  throw new Error('M22 streamed lobby contract is missing')
}

if (
  !files.lobbyArea.includes('<PbrEnvironment />') ||
  !files.lobbyArea.includes('<LobbyScene />') ||
  !files.lobbyArea.includes('<LobbyAudio />') ||
  !files.lobbyArea.includes('<TrueFirstPersonBody') ||
  !files.lobbyArea.includes('<PlayerController colliders={LOBBY_COLLIDERS}') ||
  !files.lobbyArea.includes('<PostEffects />')
) {
  throw new Error('M22 true-first-person/PBR lobby runtime contract is missing')
}

for (const id of ['security-desk', 'badge-reader', 'directory', 'b1-door']) {
  if (!files.lobbyScene.includes(`lobbyInteractableId: '${id}'`)) {
    throw new Error(`M22 lobby interactable missing: ${id}`)
  }
}

if (
  !files.interactions.includes("objectId: `lobby:${id}`") ||
  !files.interactions.includes("game.flags.badge_taken") ||
  !files.interactions.includes("setFlag('lobby_badge_verified')") ||
  !files.interactions.includes("setCheckpoint('lobby-badge-verified'") ||
  !files.interactions.includes("setFlag('lobby_left_for_b1')") ||
  !files.interactions.includes("'locker-b1'") ||
  !files.interactions.includes("'locker-entry'") ||
  !files.interactions.includes("'badge-reader'") ||
  !files.interactions.includes('CORVUS FACILITIES — Procedimento 06-B.')
) {
  throw new Error('M22 security/checkpoint/B1 interaction contract is missing')
}

if (
  !files.plazaInteractions.includes("'lobby-entry'") ||
  !files.lobbyArea.includes("setFlag('lobby_entry_seen')") ||
  !files.lobbyArea.includes('setCheckpoint')
) {
  throw new Error('M22 M21-to-lobby checkpoint continuity contract is missing')
}

if (!files.colliders.includes('LOBBY_COLLIDERS')) {
  throw new Error('M22 lobby collision contract is missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('createOscillator')
) {
  throw new Error('M22 procedural lobby audio contract is missing')
}

console.log('M22 Meridian Lobby acceptance passed')
