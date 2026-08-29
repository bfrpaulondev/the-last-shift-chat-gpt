import { readFile } from 'node:fs/promises'

const streetInteractions = await readFile('src/game/areas/street/StreetInteractionSystem.tsx', 'utf8')
const streetColliders = await readFile('src/game/areas/street/streetColliders.ts', 'utf8')

if (
  !streetInteractions.includes('const RANGE = 2.45') ||
  !streetInteractions.includes('const BUS_BOARDING_RANGE = 3.25') ||
  !streetInteractions.includes("id === 'bus-door' ? BUS_BOARDING_RANGE : RANGE") ||
  !streetInteractions.includes('raycaster.current.far = BUS_BOARDING_RANGE') ||
  !streetInteractions.includes('hit.distance > rangeFor(id)') ||
  !streetColliders.includes('minZ: -1.28, maxZ: -0.94')
) {
  throw new Error('Bus boarding reachability regression detected')
}

console.log('Bus boarding reachability acceptance passed')
