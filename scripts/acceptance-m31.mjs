import { readFile } from 'node:fs/promises'

const files = {
  package: await readFile('package.json', 'utf8'),
  areaTypes: await readFile('src/game/flow/areaTypes.ts', 'utf8'),
  store: await readFile('src/game/state/gameStore.ts', 'utf8'),
  app: await readFile('src/App.tsx', 'utf8'),
  hud: await readFile('src/game/ui/GameHud.tsx', 'utf8'),
  anxiety: await readFile('src/game/anxiety/Part3AnxietyController.tsx', 'utf8'),
  awakeningArea: await readFile('src/game/areas/blackout/BlackoutArea.tsx', 'utf8'),
  awakeningScene: await readFile('src/game/areas/blackout/BlackoutScene.tsx', 'utf8'),
  awakeningRecovery: await readFile('src/game/areas/blackout/BlackoutRecoveryController.tsx', 'utf8'),
  awakeningInteractions: await readFile('src/game/areas/blackout/BlackoutInteractionSystem.tsx', 'utf8'),
  breakroomDoor: await readFile('src/game/areas/blackout/BreakroomDoorTension.tsx', 'utf8'),
  wristReadout: await readFile('src/game/areas/blackout/WristBpmReadout.tsx', 'utf8'),
  awakeningAudio: await readFile('src/game/areas/blackout/BlackoutAudio.tsx', 'utf8'),
  stairScene: await readFile('src/game/areas/stairwell/StairwellScene.tsx', 'utf8'),
  stairInteractions: await readFile('src/game/areas/stairwell/StairwellInteractionSystem.tsx', 'utf8'),
  stairAudio: await readFile('src/game/areas/stairwell/StairwellAudio.tsx', 'utf8'),
  player: await readFile('src/game/player/PlayerController.tsx', 'utf8'),
  serverApp: await readFile('server/app.js', 'utf8'),
  saveModel: await readFile('server/models/Save.js', 'utf8'),
}

if (!files.package.includes('acceptance-m30.mjs && node scripts/acceptance-m31.mjs')) {
  throw new Error('M31 must preserve prior acceptance and append M31')
}

if (
  !files.areaTypes.includes("export type GamePart = 'part-1' | 'part-2' | 'part-3'") ||
  !files.areaTypes.includes("chapter: 'part-3-awakening'") ||
  !files.areaTypes.includes("label: '37.º Andar — 23:47'") ||
  !files.areaTypes.includes("label: 'Escada de Emergência — 37 → 39'")
) {
  throw new Error('Part 3 canonical area classification is missing')
}

if (
  !files.serverApp.includes("'part-3'") ||
  !files.serverApp.includes("'emergency-stairwell'") ||
  !files.saveModel.includes("'part-1'") ||
  !files.saveModel.includes("'part-2'") ||
  !files.saveModel.includes("'part-3'") ||
  !files.saveModel.includes("'emergency-stairwell'") ||
  !files.store.includes('canonicalizeLocation') ||
  !files.store.includes("location.area === 'emergency-stairwell'")
) {
  throw new Error('Part 3 Mongo/API persistence or legacy-save migration contract is missing')
}

if (
  !files.store.includes('bpm: number') ||
  !files.store.includes('setBpm:') ||
  !files.store.includes('adjustBpm:') ||
  !files.anxiety.includes('8 * (TICK_MS / 1000)') ||
  !files.anxiety.includes('-4 * (TICK_MS / 1000)') ||
  !files.anxiety.includes('>= 2000') ||
  !files.anxiety.includes('adjustBpm(-12)') ||
  !files.anxiety.includes('frequency.setValueAtTime(55') ||
  !files.app.includes('<Part3AnxietyController />')
) {
  throw new Error('BPM/panic/breath-control implementation is incomplete')
}

if (
  !files.hud.includes('<strong>23:47</strong>') ||
  !files.hud.includes('Quem entrou duas vezes, só saiu uma') ||
  !files.hud.includes('part3-panic-vignette') ||
  !files.wristReadout.includes('CanvasTexture') ||
  !files.wristReadout.includes('`${sampledBpm} BPM`')
) {
  throw new Error('Frozen watch, note pin, panic feedback or diegetic BPM readout is missing')
}

for (const text of [
  'Boa noite, colega.',
  'Você limpa o que os olhos veem. Eu limpo o que o prédio esconde.',
  'Quem entrou duas vezes, só saiu uma. A resposta mora no porão.',
  "P.S.: the building's clock lies sometimes. Check it.",
  'Trancada. Do lado de fora. Com o MEU crachá.',
]) {
  if (!files.awakeningInteractions.includes(text)) {
    throw new Error(`Canonical Part 3 text missing: ${text}`)
  }
}

if (
  !files.awakeningRecovery.includes("setBpm(128)") ||
  !files.awakeningRecovery.includes("setFlag('badge_stolen')") ||
  !files.awakeningRecovery.includes("setFlag('cup_missing')") ||
  !files.awakeningInteractions.includes("setFlag('note_read')") ||
  !files.awakeningInteractions.includes("setFlag('door37_locked')") ||
  !files.awakeningInteractions.includes("'stairwell-floor-37'")
) {
  throw new Error('Awakening mandatory progression/flags are incomplete')
}

if (
  !files.awakeningScene.includes('RAIN_COUNT = 180') ||
  !files.awakeningScene.includes("blackoutInteractableId: 'phone-37'") ||
  !files.awakeningScene.includes("blackoutInteractableId: 'fallen-bucket'") ||
  !files.awakeningScene.includes("blackoutInteractableId: 'ceo-door-night'") ||
  !files.breakroomDoor.includes('degToRad(15)') ||
  !files.breakroomDoor.includes("setFlag('breakroom_door_shifted')") ||
  !files.awakeningAudio.includes('3997') ||
  !files.awakeningAudio.includes('4003')
) {
  throw new Error('Night 37 physical/tension/audio continuity is incomplete')
}

if (
  !files.stairScene.includes("setFlag('reader38_green')") ||
  !files.stairInteractions.includes("setFlag('stairwell_reached_38')") ||
  !files.stairInteractions.includes("setFlag('stairwell_reached_39')") ||
  !files.stairInteractions.includes("setFlag('sc39_open')") ||
  !files.stairAudio.includes('REVERB_SECONDS = 2.8') ||
  !files.stairAudio.includes('LATE_ECHO_SECONDS = 0.5') ||
  !files.player.includes("new CustomEvent('game:footstep'")
) {
  throw new Error('Canonical 37→39 stairwell contract is incomplete')
}

if (
  !files.awakeningInteractions.includes('subtitleQueue.length > 0') ||
  !files.stairInteractions.includes('subtitleQueue.length > 0') ||
  !files.awakeningArea.includes('<TrueFirstPersonBody')
) {
  throw new Error('Dialogue serialization or True First Person regression detected')
}

console.log('M31 Part 3 Awakening canonical acceptance passed')
