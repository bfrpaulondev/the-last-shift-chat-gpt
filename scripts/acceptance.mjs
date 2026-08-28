import { readFile } from 'node:fs/promises'

const files = {
  interactables: await readFile('src/game/data/interactables.tsx', 'utf8'),
  camera: await readFile('src/game/player/CameraPolish.tsx', 'utf8'),
  clock: await readFile('src/game/ui/GameClock.tsx', 'utf8'),
  styles: await readFile('src/styles.css', 'utf8'),
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

const requiredSnippets = [
  '[E] Fechar a torreia',
  'CRACHÁ Nº 4471',
  'CELULAR — 12%',
  'Sair de casa — pegar o ônibus das 06:05.',
]

for (const id of requiredInteractables) {
  if (!files.interactables.includes(`${id}:`)) {
    throw new Error(`Missing interactable: ${id}`)
  }
}

for (const snippet of requiredSnippets) {
  if (!files.interactables.includes(snippet) && !files.clock.includes(snippet)) {
    throw new Error(`Missing required scene contract text: ${snippet}`)
  }
}

if (!files.camera.includes('DEFAULT_FOV = 70') || !files.camera.includes('INSPECTION_FOV = 35')) {
  throw new Error('Inspection zoom contract is missing')
}

if (!files.clock.includes('START_MINUTES = 320') || !files.clock.includes('SECONDS_PER_MINUTE = 10')) {
  throw new Error('Game clock contract is missing')
}

if (!files.styles.includes('opacity: 0.04') || !files.styles.includes('radial-gradient')) {
  throw new Error('PSX screen effects contract is missing')
}

for (const route of ['/api/save', '/api/telemetry', '/api/health']) {
  if (!files.server.includes(route)) {
    throw new Error(`Missing API route: ${route}`)
  }
}

console.log('Scene 1 acceptance contract: OK')
