import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.9
const FLOOR38_SPAWN = { x: 0, y: 1.65, z: 0.9, yaw: Math.PI }
const FLOOR39_SPAWN = { x: 0, y: 1.65, z: -4.8, yaw: 0 }
const SECURITY_CENTER_SPAWN = { x: 0, y: 1.65, z: 5.2, yaw: Math.PI }

function findStairwellInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.stairwellInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'flight-to-38') return '[E] Subir para o 38.º'
  if (id === 'flight-to-39') return '[E] Subir para o 39.º'
  if (id === 'door-39') return '[E] Passar pela porta do 39.º'
  return null
}

export function StairwellInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())
  const busy = useRef(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const game = useGameStore.getState()

      if (game.note) {
        if (event.code === 'KeyE' || event.code === 'Escape') game.closeNote()
        return
      }
      if (game.subtitle || game.subtitleQueue.length > 0) {
        if (event.code === 'Space' && game.subtitle) {
          event.preventDefault()
          game.dismissSubtitle()
        }
        return
      }
      if (
        event.defaultPrevented ||
        event.code !== 'KeyE' ||
        busy.current ||
        game.cinematic ||
        game.areaTransition ||
        game.demoEnded
      ) return

      const id = currentId.current
      if (!id) return
      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const interactionFlag = `stairwell_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `stairwell:${id}`,
        wasFirstTime,
      })
      game.setFlag(interactionFlag)

      if (id === 'flight-to-38') {
        if (game.flags.stairwell_reached_38) return
        busy.current = true
        game.triggerHandAction('brace', 980, target, id)
        game.setFlag('stairwell_reached_38')
        game.setCheckpoint('stairwell-floor-38', FLOOR38_SPAWN)
        game.requestAreaTransition(
          'emergency-stairwell',
          'stairwell-floor-38',
          FLOOR38_SPAWN,
          1050,
        )
        window.setTimeout(() => { busy.current = false }, 1100)
        return
      }

      if (id === 'flight-to-39') {
        if (!game.flags.reader38_green || game.flags.stairwell_reached_39) return
        busy.current = true
        game.triggerHandAction('brace', 980, target, id)
        game.setFlag('stairwell_reached_39')
        game.setCheckpoint('stairwell-floor-39', FLOOR39_SPAWN)
        game.requestAreaTransition(
          'emergency-stairwell',
          'stairwell-floor-39',
          FLOOR39_SPAWN,
          1050,
        )
        window.setTimeout(() => { busy.current = false }, 1100)
        return
      }

      if (id === 'door-39') {
        if (!game.flags.stairwell_reached_39) return
        game.triggerHandAction('door', 900, target, id, 'door-handle')
        if (!game.flags.sc39_open) {
          game.setFlag('sc39_open')
          game.setCheckpoint('stairwell-floor-39-ready', game.location.spawn)
        }
        busy.current = true
        window.setTimeout(() => {
          const latest = useGameStore.getState()
          if (latest.location.area !== 'emergency-stairwell') return
          latest.requestAreaTransition(
            'security-center',
            'security-center-entry',
            SECURITY_CENTER_SPAWN,
            1100,
          )
        }, 450)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useFrame(() => {
    const game = useGameStore.getState()
    if (
      game.note ||
      game.subtitle ||
      game.subtitleQueue.length > 0 ||
      game.cinematic ||
      game.areaTransition ||
      game.demoEnded
    ) {
      currentId.current = null
      game.setPrompt(null)
      return
    }

    raycaster.current.setFromCamera(CENTER, camera)
    raycaster.current.far = RANGE
    const hits = raycaster.current.intersectObjects(scene.children, true)
    let next: string | null = null

    for (const hit of hits) {
      if (hit.distance > RANGE) break
      const id = findStairwellInteractable(hit.object)
      if (!id) continue
      if (id === 'reader-38') continue
      if (id === 'flight-to-38' && game.flags.stairwell_reached_38) continue
      if (id === 'flight-to-39' && (!game.flags.reader38_green || game.flags.stairwell_reached_39)) continue
      if (id === 'door-39' && !game.flags.stairwell_reached_39) continue
      const prompt = promptFor(id)
      if (!prompt) continue
      next = id
      point.current.copy(hit.point)
      game.setPrompt(prompt)
      break
    }

    if (!next) game.setPrompt(null)
    currentId.current = next
  })

  return null
}
