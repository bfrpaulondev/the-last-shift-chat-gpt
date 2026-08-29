import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  director: await readFile('src/game/flow/AreaDirector.tsx', 'utf8'),
  player: await readFile('src/game/player/PlayerController.tsx', 'utf8'),
  anxiety: await readFile('src/game/anxiety/Part3AnxietyController.tsx', 'utf8'),
  securityArea: await readFile('src/game/areas/security/SecurityCenterArea.tsx', 'utf8'),
  securityInteractions: await readFile('src/game/areas/security/SecurityCenterInteractionSystem.tsx', 'utf8'),
  area: await readFile('src/game/areas/descentLobby/DescentLobbyArea.tsx', 'utf8'),
  geometry: await readFile('src/game/areas/descentLobby/descentGeometry.ts', 'utf8'),
  colliders: await readFile('src/game/areas/descentLobby/descentLobbyColliders.ts', 'utf8'),
  descent: await readFile('src/game/areas/descentLobby/DescentProgressController.tsx', 'utf8'),
  stairs: await readFile('src/game/areas/descentLobby/DescentStairwellScene.tsx', 'utf8'),
  lobby: await readFile('src/game/areas/descentLobby/NightLobbyScene.tsx', 'utf8'),
  sequence: await readFile('src/game/areas/descentLobby/NascimentoSequence.tsx', 'utf8'),
  interactions: await readFile('src/game/areas/descentLobby/NightLobbyInteractionSystem.tsx', 'utf8'),
  audio: await readFile('src/game/areas/descentLobby/AreaKAudio.tsx', 'utf8'),
  store: await readFile('src/game/state/gameStore.ts', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
  model: await readFile('server/models/Save.js', 'utf8'),
}

if (!files.package.includes('acceptance-m32.mjs && node scripts/acceptance-m33.mjs')) {
  throw new Error('M33 must append to the complete M1-M32 acceptance chain')
}

if (
  !files.areaTypes.includes("| 'descent-lobby'") ||
  !files.areaTypes.includes("chapter: 'part-3-descent-lobby'") ||
  !files.areaTypes.includes("defaultCheckpoint: 'descent-floor-39'") ||
  !files.director.includes("area === 'descent-lobby'") ||
  !files.director.includes('<DescentLobbyArea')
) {
  throw new Error('Area K streaming/registry contract is incomplete')
}

if (
  !files.securityInteractions.includes("'descent-lobby'") ||
  !files.securityInteractions.includes("'descent-floor-39'") ||
  !files.securityInteractions.includes("setFlag('descent_route_started')") ||
  !files.securityArea.includes('elevator_returned_39') ||
  !files.securityArea.includes('A caderneta está com você. O terminal principal aguarda.')
) {
  throw new Error('M32 to M33 handoff or M33 return boundary is missing')
}

if (
  !files.player.includes('groundHeight?: (x: number, z: number) => number') ||
  !files.player.includes('groundHeight ? groundHeight(camera.position.x, camera.position.z) : 0') ||
  !files.area.includes('<TrueFirstPersonBody') ||
  !files.area.includes('<PlayerController') ||
  !files.area.includes('<PostEffects />')
) {
  throw new Error('True first-person or physical stair-ground continuity regressed')
}

if (
  !files.geometry.includes('DESCENT_START_FLOOR = 39') ||
  !files.geometry.includes('DESCENT_FLOOR_DROP = 1.15') ||
  !files.geometry.includes('descentReversed') ||
  !files.geometry.includes('reachedDescentLanding') ||
  !files.stairs.includes('reversed ? Math.PI : 0') ||
  !files.colliders.includes('descentCollidersForFloor') ||
  !files.descent.includes('useFrame') ||
  files.descent.includes('setInterval') ||
  files.descent.includes('camera.position.set(')
) {
  throw new Error('39-to-ground descent must be player-driven, alternating and camera-continuous')
}

for (const floor of ['36', '30', '24', '18', '13', '9', '3', '1']) {
  if (!files.descent.includes(floor)) throw new Error(`Missing persistent descent checkpoint coverage near floor ${floor}`)
}

if (
  !files.audio.includes("keys.current.has('ShiftLeft')") ||
  !files.audio.includes('const intensity = 0.12 + ((game.bpm - 60) / 100) * 0.16') ||
  !files.audio.includes('setInterval(playBreath, 520)')
) {
  throw new Error('Sprint breathing does not dominate the long descent as required')
}

if (
  !files.lobby.includes('RAIN_COUNT = 180') ||
  !files.lobby.includes('clearcoat={0.9}') ||
  !files.lobby.includes('OrangeStrobes') ||
  !files.lobby.includes('a Meridian Tower sedia AMANHÃ') ||
  !files.lobby.includes('a reunião anual do conselho da Corvus') ||
  !files.lobby.includes('NascimentoFigure') ||
  !files.lobby.includes("areaKInteractableId: 'nascimento'") ||
  !files.lobby.includes('LobbyCamera')
) {
  throw new Error('Canonical night lobby physical composition is incomplete')
}

for (const text of [
  'Ele... já tava dentro, Bruno... desde antes... ninguém viu porque ninguém... anota...',
  'Eu anotei... trinta anos... eu anotei TUDO... computador é bom... mas só se alguém... escrever a verdade nele...',
  'Você não fez nada de errado, menino. Os registros vão provar... se você souber... ler.',
]) {
  if (!files.sequence.includes(text)) throw new Error(`Canonical Nascimento dialogue missing: ${text}`)
}

if (
  !files.interactions.includes('adjustBpm(15)') ||
  !files.sequence.includes("setFlag('nascimento_notebook_push')") ||
  !files.sequence.includes("setFlag('nascimento_wrist_grab')") ||
  !files.sequence.includes("setFlag('nascimento_camera_gaze')") ||
  !files.lobby.includes('elapsed < 420 ? 1 : 0.18') ||
  !files.sequence.includes("setFlag('nascimento_dead')")
) {
  throw new Error('Nascimento physical performance/BPM/camera gaze sequence is incomplete')
}

if (
  !files.sequence.includes("new CustomEvent('part3:total-silence'") ||
  !files.sequence.includes('durationMs: 4000') ||
  !files.anxiety.includes("part3:total-silence") ||
  !files.audio.includes('silenceRestoreUntil.current = silenceUntil.current + 2000')
) {
  throw new Error('Canonical four-second total silence and slow rain return are missing')
}

if (
  !files.interactions.includes("new Event('lobby:notebook-transfer')") ||
  !files.lobby.includes('[0, 1, 2, 3, 4].map') ||
  !files.interactions.includes("setFlag('notebook_taken')") ||
  !files.interactions.includes("setFlag('closed_eyes')") ||
  !files.interactions.includes("'nascimento-eyes'")
) {
  throw new Error('Five-stage notebook handoff or optional eye-closing interaction is incomplete')
}

if (
  !files.sequence.includes('Sinto muito pelo seu amigo. Ele era de um tempo melhor.') ||
  !files.sequence.includes('Faz o favor de devolver minha caderneta depois. Preciso dela. — ShadowByte') ||
  !files.sequence.includes('Tudo aqui dentro pode ser reescrito. Menos isso.') ||
  !files.interactions.includes("setFlag('shadowbyte_contact_1')") ||
  !files.audio.includes("filter.type = 'bandpass'") ||
  !files.audio.includes('createWaveShaper()')
) {
  throw new Error('ShadowByte radio contact or permanent compressed/distorted voice treatment is missing')
}

if (
  !files.interactions.includes('MODO RESTRITO — ACESSO EXTERNO BLOQUEADO — CENTRAL DE MONITORAMENTO NOTIFICADA') ||
  !files.interactions.includes('Trancados juntos, então. Ele e eu.') ||
  !files.interactions.includes("setFlag('exit_locked')")
) {
  throw new Error('Optional restricted lobby exit contract is missing')
}

if (
  !files.sequence.includes("new Event('lobby:elevator-cables')") ||
  !files.sequence.includes('}, 2000)') ||
  !files.sequence.includes("setFlag('elevator_alone')") ||
  !files.interactions.includes('schedule(() => emitIndicator(13), 1400)') ||
  !files.interactions.includes('}, 1900)') ||
  !files.interactions.includes("setFlag('elevator_pause_13')") ||
  !files.interactions.includes("setFlag('elevator_returned_39')") ||
  !files.interactions.includes("'security-center-return'")
) {
  throw new Error('Empty elevator arrival, 13th-floor callback, or 39th-floor return is incomplete')
}

if (
  !files.store.includes("case 'descent-lobby':") ||
  !files.store.includes("location.area === 'descent-lobby'") ||
  !files.server.includes("'descent-lobby'") ||
  !files.model.includes("'descent-lobby'")
) {
  throw new Error('Area K reload/API/Mongo persistence contract is incomplete')
}

if (
  !files.interactions.includes('subtitleQueue.length > 0') ||
  !files.interactions.includes('dismissSubtitle') ||
  !files.sequence.includes('subtitleQueue.length > 0')
) {
  throw new Error('Serialized SPACE dialogue progression regressed')
}

console.log('M33 Area K Descent and Lobby canonical acceptance passed')
