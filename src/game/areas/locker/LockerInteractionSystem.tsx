import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8

function findLockerInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.lockerInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'player-locker') return '[E] Vestir uniforme'
  if (id === 'route-board') return '[E] Confirmar rota'
  if (id === 'service-door') return '[E] Ir para o elevador de serviço'
  return null
}

export function LockerInteractionSystem() {
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
      if (event.defaultPrevented || event.code !== 'KeyE' || busy.current || game.cinematic || game.areaTransition || game.demoEnded) return

      const id = currentId.current
      if (!id) return
      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const interactionFlag = `locker_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: `locker:${id}`, wasFirstTime })
      game.setFlag(interactionFlag)

      if (id === 'player-locker') {
        game.triggerHandAction('grab', 900, target, id)
        if (!game.flags.locker_uniform_on) {
          game.setFlag('locker_uniform_on')
          game.say('Uniforme. Pelo menos ainda serve.')
        } else {
          game.say('Já estou uniformizado.')
        }
        return
      }

      if (id === 'route-board') {
        game.triggerHandAction('reach', 700, target, id)
        if (!game.flags.locker_route_confirmed) {
          game.setFlag('locker_route_confirmed')
          game.setCheckpoint('locker-ready', game.location.spawn)
          game.openNote('ROTA DO TURNO — CORVUS FACILITIES', '22.º andar — rotina inicial\n\n30.º andar — sequência de limpeza\n\nRefeitório — pausa programada\n\n37.º andar — fechamento da rota\n\nDeslocamento entre setores: elevador de serviço.')
        } else {
          game.say('Rota confirmada. Elevador de serviço.')
        }
        return
      }

      if (id === 'service-door') {
        if (!game.flags.locker_uniform_on || !game.flags.locker_route_confirmed) {
          game.triggerHandAction('door', 620, target, id, 'door-handle')
          game.say('Primeiro uniforme e rota.')
          return
        }
        busy.current = true
        game.setFlag('locker_left_for_elevator')
        game.triggerHandAction('door', 900, target, id, 'door-handle')
        game.requestAreaTransition('service-elevator', 'elevator-cabin', { x: 0, y: 1.65, z: 2.8, yaw: Math.PI }, 1250)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useFrame(() => {
    const game = useGameStore.getState()
    if (game.note || game.subtitle || game.subtitleQueue.length > 0 || game.cinematic || game.areaTransition || game.demoEnded) {
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
      const id = findLockerInteractable(hit.object)
      if (!id) continue
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
