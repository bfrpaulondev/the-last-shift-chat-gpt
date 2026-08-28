import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  areaDirector: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  lockerArea: await readFile('src/game/areas/locker/LockerArea.tsx', 'utf8'),
  lockerScene: await readFile('src/game/areas/locker/LockerScene.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/locker/LockerInteractionSystem.tsx', 'utf8'),
  colliders: await readFile('src/game/areas/locker/lockerColliders.ts', 'utf8'),
  audio: await readFile('src/game/areas/locker/LockerAudio.tsx', 'utf8'),
  lobbyInteractions: await readFile('src/game/areas/lobby/LobbyInteractionSystem.tsx', 'utf8'),
}

if (!files.package.includes('acceptance-m22.mjs && node scripts/acceptance-m23.mjs')) {
  throw new Error('M23 must preserve M1-M22 acceptance and append M23')
}

if (
  !files.areaTypes.includes("area: 'locker-b1'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'locker-entry'") ||
  !files.areaTypes.includes("defaultSpawn: { x: 0, y: 1.65, z: 4.2") ||
  !files.areaDirector.includes("area === 'locker-b1'") ||
  !files.areaDirector.includes('<LockerArea') ||
  !files.areaDirector.includes("area !== 'locker-b1'")
) {
  throw new Error('M23 streamed B1 locker contract is missing')
}

if (
  !files.lockerArea.includes('<PbrEnvironment />') ||
  !files.lockerArea.includes('<LockerScene />') ||
  !files.lockerArea.includes('<LockerAudio />') ||
  !files.lockerArea.includes('<TrueFirstPersonBody') ||
  !files.lockerArea.includes('<PlayerController colliders={LOCKER_COLLIDERS}') ||
  !files.lockerArea.includes('<PostEffects />')
) {
  throw new Error('M23 true-first-person/PBR locker runtime contract is missing')
}

for (const id of ['player-locker', 'route-board', 'service-door']) {
  if (!files.lockerScene.includes(`lockerInteractableId: '${id}'`)) {
    throw new Error(`M23 locker interactable missing: ${id}`)
  }
}

if (
  !files.interactions.includes("objectId: `locker:${id}`") ||
  !files.interactions.includes("setFlag('locker_uniform_on')") ||
  !files.interactions.includes("setFlag('locker_route_confirmed')") ||
  !files.interactions.includes("setCheckpoint('locker-ready'") ||
  !files.interactions.includes("setFlag('locker_left_for_elevator')") ||
  !files.interactions.includes("'service-elevator'") ||
  !files.interactions.includes("'elevator-cabin'") ||
  !files.interactions.includes("game.flags.locker_uniform_on") ||
  !files.interactions.includes("game.flags.locker_route_confirmed")
) {
  throw new Error('M23 uniform/route/elevator interaction contract is missing')
}

if (
  !files.lobbyInteractions.includes("'locker-b1'") ||
  !files.lobbyInteractions.includes("'locker-entry'") ||
  !files.lockerArea.includes("setFlag('locker_entry_seen')") ||
  !files.lockerArea.includes('setCheckpoint')
) {
  throw new Error('M23 M22-to-B1 checkpoint continuity contract is missing')
}

if (!files.colliders.includes('LOCKER_COLLIDERS')) {
  throw new Error('M23 locker collision contract is missing')
}

if (
  !files.audio.includes('AudioContext') ||
  !files.audio.includes('audioEngine.isMuted()') ||
  !files.audio.includes('createOscillator')
) {
  throw new Error('M23 procedural locker audio contract is missing')
}

console.log('M23 B1 Locker acceptance passed')
