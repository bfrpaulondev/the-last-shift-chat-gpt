import { readFile } from 'node:fs/promises'

const files = {
  app: await readFile('src/App.tsx', 'utf8'),
  skeleton: await readFile('src/game/ApartmentSkeleton.tsx', 'utf8'),
  scene: await readFile('src/game/ApartmentScene.tsx', 'utf8'),
  interactables: await readFile('src/game/data/interactables.tsx', 'utf8'),
  interaction: await readFile('src/game/interaction/InteractionSystem.tsx', 'utf8'),
  cinematicProps: await readFile('src/game/interaction/CinematicPropAnimations.tsx', 'utf8'),
  interactionFoley: await readFile('src/game/audio/InteractionFoley.ts', 'utf8'),
  gameStore: await readFile('src/game/state/gameStore.ts', 'utf8'),
  player: await readFile('src/game/player/PlayerController.tsx', 'utf8'),
  body: await readFile('src/game/player/TrueFirstPersonBody.tsx', 'utf8'),
  rat: await readFile('src/game/events/RatScare.tsx', 'utf8'),
  suspense: await readFile('src/game/audio/SuspenseCue.ts', 'utf8'),
  colliders: await readFile('src/game/physics/colliders.ts', 'utf8'),
  camera: await readFile('src/game/player/CameraPolish.tsx', 'utf8'),
  clock: await readFile('src/game/ui/GameClock.tsx', 'utf8'),
  interiorRealism: await readFile('src/game/InteriorRealismDetails.tsx', 'utf8'),
  narrativeRealism: await readFile('src/game/NarrativePropRealism.tsx', 'utf8'),
  atmosphere: await readFile('src/game/AtmosphereDetails.tsx', 'utf8'),
  lighting: await readFile('src/game/ApartmentLighting.tsx', 'utf8'),
  brokenLight: await readFile('src/game/effects/BrokenBathroomLight.tsx', 'utf8'),
  drip: await readFile('src/game/effects/FaucetDrip.tsx', 'utf8'),
  rain: await readFile('src/game/weather/ExteriorRain.tsx', 'utf8'),
  post: await readFile('src/game/render/PostEffects.tsx', 'utf8'),
  environment: await readFile('src/game/render/PbrEnvironment.tsx', 'utf8'),
  textures: await readFile('src/game/materials/proceduralTextures.ts', 'utf8'),
  surfaceMaps: await readFile('src/game/materials/pbrSurfaceMaps.ts', 'utf8'),
  styles: await readFile('src/styles.css', 'utf8'),
  server: await readFile('server/app.js', 'utf8'),
}

for (const id of [
  'bed', 'faucet_bathroom', 'mirror', 'shower', 'fridge_note', 'coffee',
  'badge', 'phone', 'window', 'clock', 'frame', 'door_exit',
]) {
  if (!files.interactables.includes(`${id}:`)) throw new Error(`Missing interactable: ${id}`)
}

for (const snippet of ['[E] Fechar a torneira', 'CRACHÁ Nº 4471', 'CELULAR — 12%']) {
  if (!files.interactables.includes(snippet)) throw new Error(`Missing required scene text: ${snippet}`)
}

if (
  !files.gameStore.includes('dismissSubtitle') ||
  !files.interaction.includes("event.code === 'Space'") ||
  !files.interaction.includes('state.subtitle || state.subtitleQueue.length > 0')
) throw new Error('Serialized SPACE dialogue contract is missing')

if (
  !files.interaction.includes('coffee_failed_once') ||
  !files.interaction.includes('coffee_failed_twice') ||
  !files.interaction.includes('badge_dropped')
) throw new Error('Interaction surprise contract is missing')

if (
  !files.rat.includes('RatScare') ||
  !files.rat.includes('suspenseCue.play()') ||
  !files.suspense.includes('duration = 6.8') ||
  !files.suspense.includes('exponentialRampToValueAtTime(0.0001')
) throw new Error('Rat scare/suspense contract is missing')

if (!files.camera.includes('DEFAULT_FOV = 70') || !files.camera.includes('INSPECTION_FOV = 35')) {
  throw new Error('Inspection zoom contract is missing')
}
if (!files.clock.includes('START_MINUTES = 320') || !files.clock.includes('SECONDS_PER_MINUTE = 10')) {
  throw new Error('Game clock contract is missing')
}

if (
  !files.app.includes('dpr={[1.5, 2]}') ||
  !files.app.includes('gl.toneMappingExposure = 0.86') ||
  !files.app.includes('near: 0.05') ||
  !files.lighting.includes('<rectAreaLight')
) throw new Error('Realistic renderer/camera foundation is missing')

if (
  !files.skeleton.includes('<PbrEnvironment />') ||
  !files.environment.includes('RoomEnvironment') ||
  !files.environment.includes('PMREMGenerator') ||
  !files.post.includes('SSAOPass') ||
  !files.post.includes('UnrealBloomPass') ||
  !files.post.includes('FXAAShader') ||
  !files.post.includes('OutputPass')
) throw new Error('Free Three.js rendering pipeline is missing')

if (
  !files.surfaceMaps.includes('createPbrSurfaceMaps') ||
  !files.surfaceMaps.includes('THREE.NoColorSpace') ||
  !files.scene.includes('roughnessMap={textures.wallRoughness}') ||
  !files.scene.includes('bumpMap={textures.woodBump}') ||
  !files.scene.includes('roughnessMap={textures.tileRoughness}') ||
  !files.scene.includes('roughnessMap={textures.brushedMetalRoughness}') ||
  !files.scene.includes('<meshPhysicalMaterial')
) throw new Error('M13 PBR materials contract is missing')

if (
  !files.rain.includes('NEAR_RAIN_COUNT = 280') ||
  !files.rain.includes('MID_RAIN_COUNT = 440') ||
  !files.rain.includes('FAR_RAIN_COUNT = 360') ||
  !files.rain.includes('function WetWindow()') ||
  !files.rain.includes('WINDOW_DROPS = 26') ||
  !files.atmosphere.includes('function MovingTraffic()') ||
  !files.atmosphere.includes('beacon.current') ||
  !files.atmosphere.includes('clearcoat={0.5}')
) throw new Error('M14 exterior/weather contract is missing')

if (
  !files.skeleton.includes('<InteriorRealismDetails />') ||
  !files.skeleton.includes('<NarrativePropRealism />') ||
  !files.interiorRealism.includes('function BedroomLivedIn') ||
  !files.interiorRealism.includes('function BathroomLivedIn') ||
  !files.interiorRealism.includes('function KitchenLivedIn') ||
  !files.interiorRealism.includes('function HallwayLivedIn') ||
  !files.interiorRealism.includes('createReceiptTexture') ||
  !files.interiorRealism.includes('<tubeGeometry') ||
  !files.narrativeRealism.includes('function FridgeNoteWear') ||
  !files.narrativeRealism.includes('function FrameWear') ||
  !files.narrativeRealism.includes('function DoorAge')
) throw new Error('M15 lived-in interior contract is missing')

if (
  !files.skeleton.includes('<TrueFirstPersonBody enabled={gameStarted && !demoEnded} />') ||
  files.skeleton.includes('FirstPersonHands') ||
  !files.body.includes('export function TrueFirstPersonBody') ||
  !files.body.includes('function ArticulatedHand') ||
  !files.body.includes('LEFT_SHOULDER') ||
  !files.body.includes('RIGHT_SHOULDER') ||
  !files.body.includes('setSegment(leftUpperArm.current') ||
  !files.body.includes('setSegment(rightForearm.current') ||
  !files.body.includes('leftThigh.current.rotation.x') ||
  !files.body.includes('rightKnee.current.rotation.x') ||
  !files.body.includes('bodyYaw.current = dampAngle') ||
  !files.body.includes('Math.min(s.reachVector.length(), 0.72)') ||
  !files.body.includes('handAction.target') ||
  !files.body.includes('fingerRoots.current.forEach') ||
  !files.body.includes('const scratch = useRef({') ||
  !files.body.includes('const NAIL =') ||
  !files.body.includes('<RoundedBox args={[0.43, 0.34, 0.2]}')
) throw new Error('M16 true first person articulated body contract is missing')

if (
  !files.gameStore.includes('target?: [number, number, number]') ||
  !files.gameStore.includes('objectId?: string') ||
  !files.gameStore.includes("| 'badge-slip'") ||
  !files.interaction.includes('interactionPoint = useRef(new THREE.Vector3())') ||
  !files.interaction.includes('canonicalInteractionTarget') ||
  !files.interaction.includes("return [1.27, 1.08, 2.815]") ||
  !files.interaction.includes("return [1.98, 1.055, -2.705]") ||
  !files.interaction.includes("return [-1.6, 1.315, 2.365]") ||
  !files.interaction.includes("'coffee', 'coffee-press'") ||
  !files.interaction.includes("'badge', 'badge-slip'") ||
  !files.interaction.includes("'badge', 'badge-pickup'") ||
  !files.interaction.includes("'phone', 'phone-lift'") ||
  !files.interaction.includes("'door_exit', 'door-handle'") ||
  !files.interaction.includes("'faucet_bathroom', 'faucet-turn'")
) throw new Error('M17 object-specific interaction sequencing contract is missing')

if (
  !files.skeleton.includes('<CinematicPropAnimations />') ||
  !files.cinematicProps.includes('function DoorHardware()') ||
  !files.cinematicProps.includes('function FaucetHardware()') ||
  !files.cinematicProps.includes('function CoffeeHardware()') ||
  !files.cinematicProps.includes('function PhoneProxy()') ||
  !files.cinematicProps.includes('function BadgeProxy()') ||
  !files.cinematicProps.includes("action.variant === 'badge-slip'") ||
  !files.cinematicProps.includes("action.variant === 'badge-pickup'") ||
  !files.cinematicProps.includes('cinematic-phone-proxy') ||
  !files.cinematicProps.includes('material.emissiveIntensity')
) throw new Error('M17 responsive animated prop contract is missing')

if (
  !files.body.includes("handAction.objectId === 'coffee'") ||
  !files.body.includes("handAction.objectId === 'door_exit'") ||
  !files.body.includes("handAction.objectId === 'faucet_bathroom'") ||
  !files.body.includes("handAction.objectId === 'phone'") ||
  !files.body.includes("handAction.objectId === 'badge'") ||
  !files.body.includes("handAction.variant === 'badge-pickup'") ||
  !files.body.includes('function gripWindow(progress: number)') ||
  !files.body.includes('s.interactionQuaternion.setFromEuler')
) throw new Error('M17 cinematic hand/wrist choreography contract is missing')

if (
  !files.interactionFoley.includes('class InteractionFoley') ||
  !files.interactionFoley.includes('playDoorHandle()') ||
  !files.interactionFoley.includes('playFaucetTurn()') ||
  !files.interactionFoley.includes('playCoffeeButton()') ||
  !files.interactionFoley.includes('playPhonePickup()') ||
  !files.interactionFoley.includes('playBadgeHandling()') ||
  !files.interactionFoley.includes('audioEngine.isMuted()')
) throw new Error('M17 procedural interaction foley contract is missing')

if (
  !files.textures.includes('createFridgeNoteTexture') ||
  !files.textures.includes('createFamilyPhotoTexture') ||
  !files.drip.includes('DROP_PERIOD = 1.6') ||
  !files.brokenLight.includes('flickerValue') ||
  !files.styles.includes('radial-gradient')
) throw new Error('Visual storytelling/atmosphere contract is missing')

const playerRadiusMatch = files.player.match(/PLAYER_RADIUS = ([0-9.]+)/)
if (!playerRadiusMatch) throw new Error('Player radius not found')
const playerRadius = Number(playerRadiusMatch[1])
const colliderPattern = /\{ minX: (-?[0-9.]+), maxX: (-?[0-9.]+), minZ: (-?[0-9.]+), maxZ: (-?[0-9.]+) \}/g
const colliders = [...files.colliders.matchAll(colliderPattern)].map((match) => ({
  minX: Number(match[1]), maxX: Number(match[2]), minZ: Number(match[3]), maxZ: Number(match[4]),
}))
if (colliders.length < 10) throw new Error('Apartment collider contract could not be parsed')

function blocked(x, z) {
  return colliders.some((c) => (
    x + playerRadius > c.minX && x - playerRadius < c.maxX &&
    z + playerRadius > c.minZ && z - playerRadius < c.maxZ
  ))
}
for (let z = -0.45; z >= -1.55; z -= 0.05) {
  if (blocked(2.45, z)) throw new Error(`Bathroom path blocked at x=2.45 z=${z.toFixed(2)}`)
}

for (const route of ['/api/save', '/api/telemetry', '/api/health']) {
  if (!files.server.includes(route)) throw new Error(`Missing API route: ${route}`)
}

console.log('Scene 1 acceptance contract: OK')
