import { readFile } from 'node:fs/promises'

const files = {
  interactables: await readFile('src/game/data/interactables.tsx', 'utf8'),
  interaction: await readFile('src/game/interaction/InteractionSystem.tsx', 'utf8'),
  gameStore: await readFile('src/game/state/gameStore.ts', 'utf8'),
  player: await readFile('src/game/player/PlayerController.tsx', 'utf8'),
  hands: await readFile('src/game/player/FirstPersonHands.tsx', 'utf8'),
  rat: await readFile('src/game/events/RatScare.tsx', 'utf8'),
  suspense: await readFile('src/game/audio/SuspenseCue.ts', 'utf8'),
  colliders: await readFile('src/game/physics/colliders.ts', 'utf8'),
  camera: await readFile('src/game/player/CameraPolish.tsx', 'utf8'),
  clock: await readFile('src/game/ui/GameClock.tsx', 'utf8'),
  styles: await readFile('src/styles.css', 'utf8'),
  immersionStyles: await readFile('src/immersion.css', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
}

const requiredInteractables = [
  'bed',
  'faucet_bathroom',
  'mirror',
  'shower',
  'fridge_note',
  'coffee',
  'badge',
  'phone',
  'window',
  'clock',
  'frame',
  'door_exit',
]

const requiredInteractionText = [
  '[E] Fechar a torneira',
  'CRACHÁ Nº 4471',
  'CELULAR — 12%',
]

for (const id of requiredInteractables) {
  if (!files.interactables.includes(`${id}:`)) {
    throw new Error(`Missing interactable: ${id}`)
  }
}

for (const snippet of requiredInteractionText) {
  if (!files.interactables.includes(snippet)) {
    throw new Error(`Missing required scene contract text: ${snippet}`)
  }
}

if (!files.gameStore.includes('Sair de casa — pegar o ônibus das 06:05.')) {
  throw new Error('Exit objective contract is missing')
}

if (
  !files.gameStore.includes('dismissSubtitle') ||
  !files.interaction.includes("event.code === 'Space'")
) {
  throw new Error('Space-controlled dialogue contract is missing')
}

if (
  !files.interaction.includes('state.subtitle || state.subtitleQueue.length > 0') ||
  !files.interaction.includes('state.setPrompt(null)')
) {
  throw new Error('Interaction serialization while dialogue is active is missing')
}

if (
  !files.interaction.includes('coffee_failed_once') ||
  !files.interaction.includes('coffee_failed_twice')
) {
  throw new Error('Three-attempt coffee interaction contract is missing')
}

if (!files.interaction.includes('badge_dropped')) {
  throw new Error('Dropped badge interaction contract is missing')
}

if (
  !files.hands.includes('FirstPersonHands') ||
  !files.hands.includes('root.current.position.copy(camera.position)') ||
  !files.hands.includes('depthTest={false}') ||
  files.hands.includes('createPortal') ||
  !files.gameStore.includes('triggerHandAction')
) {
  throw new Error('Reliable first-person hands rendering contract is missing')
}

if (
  !files.rat.includes('RatScare') ||
  !files.rat.includes('suspenseCue.play()') ||
  !files.rat.includes('subtitleActive') ||
  !files.gameStore.includes('triggerScare')
) {
  throw new Error('Sequenced post-shower scare contract is missing')
}

if (
  !files.suspense.includes('class SuspenseCue') ||
  !files.suspense.includes('exponentialRampToValueAtTime(0.0001') ||
  !files.suspense.includes('duration = 6.8')
) {
  throw new Error('Fading suspense music contract is missing')
}

if (!files.camera.includes('DEFAULT_FOV = 70') || !files.camera.includes('INSPECTION_FOV = 35')) {
  throw new Error('Inspection zoom contract is missing')
}

if (!files.clock.includes('START_MINUTES = 320') || !files.clock.includes('SECONDS_PER_MINUTE = 10')) {
  throw new Error('Game clock contract is missing')
}

if (
  !files.immersionStyles.includes('image-rendering: auto') ||
  !files.immersionStyles.includes('opacity: 0.018') ||
  !files.immersionStyles.includes('.scare-flash') ||
  !files.styles.includes('radial-gradient')
) {
  throw new Error('Sharper screen effects contract is missing')
}

const playerRadiusMatch = files.player.match(/PLAYER_RADIUS = ([0-9.]+)/)
if (!playerRadiusMatch) {
  throw new Error('Player radius not found')
}
const playerRadius = Number(playerRadiusMatch[1])

const colliderPattern = /\{ minX: (-?[0-9.]+), maxX: (-?[0-9.]+), minZ: (-?[0-9.]+), maxZ: (-?[0-9.]+) \}/g
const colliders = [...files.colliders.matchAll(colliderPattern)].map((match) => ({
  minX: Number(match[1]),
  maxX: Number(match[2]),
  minZ: Number(match[3]),
  maxZ: Number(match[4]),
}))

if (colliders.length < 10) {
  throw new Error('Apartment collider contract could not be parsed')
}

function blocked(x, z) {
  return colliders.some((collider) => (
    x + playerRadius > collider.minX &&
    x - playerRadius < collider.maxX &&
    z + playerRadius > collider.minZ &&
    z - playerRadius < collider.maxZ
  ))
}

for (let z = -0.45; z >= -1.55; z -= 0.05) {
  if (blocked(2.45, z)) {
    throw new Error(`Bathroom navigation path blocked at x=2.45 z=${z.toFixed(2)}`)
  }
}

for (const route of ['/api/save', '/api/telemetry', '/api/health']) {
  if (!files.server.includes(route)) {
    throw new Error(`Missing API route: ${route}`)
  }
}

console.log('Scene 1 acceptance contract: OK')
