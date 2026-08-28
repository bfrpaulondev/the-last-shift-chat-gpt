import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.6

function findElevatorInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.elevatorInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'floor-22-button') return '[E] Selecionar 22.º andar'
  if (id === 'floor-30-button') return '[E] Selecionar 30.º andar'
  if (id === 'cafeteria-button') return '[E] Selecionar refeitório'
  if (id === 'floor-37-button') return '[E] Selecionar 37.º andar'
  if (id === 'service-notice') return '[E] Ler aviso do elevador'
  if (id === 'doors') return '[E] Sair do elevador'
  return null
}

export function ElevatorInteractionSystem() {
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
      const interactionFlag = `elevator_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({ t: performance.now() / 1000, type: 'interact', objectId: `elevator:${id}`, wasFirstTime })
      game.setFlag(interactionFlag)

      if (id === 'floor-22-button') {
        game.triggerHandAction('press', 760, target, id)
        if (!game.flags.locker_uniform_on || !game.flags.locker_route_confirmed) {
          game.say('Sem uniforme e rota confirmada eu nem devia estar aqui.')
          return
        }
        if (game.flags.floor22_routine_complete) {
          game.say('22.º concluído. Próximo é o 30.º.')
          return
        }
        if (game.flags.elevator_arrived_22) {
          game.say('22.º. Já chegamos.')
          return
        }
        if (!game.flags.elevator_ride_started) {
          game.setFlag('elevator_ride_started')
          game.setCheckpoint('elevator-ascending', game.location.spawn)
          game.say('22.º andar.')
        } else {
          game.say('Subindo.')
        }
        return
      }

      if (id === 'floor-30-button') {
        game.triggerHandAction('press', 760, target, id)
        if (!game.flags.floor22_routine_complete) {
          game.say('30.º só depois de terminar o 22.º.')
          return
        }
        if (game.flags.floor30_routine_complete) {
          game.say('30.º concluído. Próxima parada: refeitório.')
          return
        }
        if (game.flags.elevator_arrived_30) {
          game.say('30.º. Já chegamos.')
          return
        }
        if (!game.flags.elevator_ride_to_30_started) {
          game.setFlag('elevator_ride_to_30_started')
          game.setCheckpoint('elevator-ascending-30', game.location.spawn)
          game.setObjective('Siga para o 30.º andar.')
          game.say('30.º andar.')
        } else {
          game.say('Subindo para o 30.º.')
        }
        return
      }

      if (id === 'cafeteria-button') {
        game.triggerHandAction('press', 760, target, id)
        if (!game.flags.floor30_routine_complete) {
          game.say('Refeitório só depois de terminar o 30.º.')
          return
        }
        if (game.flags.cafeteria_break_complete) {
          game.say('Pausa concluída. Agora 37.º.')
          return
        }
        if (game.flags.elevator_arrived_cafeteria) {
          game.say('Refeitório. Já chegamos.')
          return
        }
        if (!game.flags.elevator_ride_to_cafeteria_started) {
          game.setFlag('elevator_ride_to_cafeteria_started')
          game.setCheckpoint('elevator-ascending-cafeteria', game.location.spawn)
          game.setObjective('Siga para o refeitório.')
          game.say('Refeitório.')
        } else {
          game.say('A caminho do refeitório.')
        }
        return
      }

      if (id === 'floor-37-button') {
        game.triggerHandAction('press', 760, target, id)
        if (!game.flags.cafeteria_break_complete) {
          game.say('37.º só depois da pausa.')
          return
        }
        if (game.flags.elevator_arrived_37) {
          game.say('37.º. Já chegamos.')
          return
        }
        if (!game.flags.elevator_ride_to_37_started) {
          game.setFlag('elevator_ride_to_37_started')
          game.setCheckpoint('elevator-ascending-37', game.location.spawn)
          game.setObjective('Siga para o 37.º andar.')
          game.say('37.º andar.')
        } else {
          game.say('Subindo para o 37.º.')
        }
        return
      }

      if (id === 'service-notice') {
        game.triggerHandAction('reach', 650, target, id)
        game.openNote(
          'ELEVADOR DE SERVIÇO — CORVUS FACILITIES',
          'Uso exclusivo de funcionários e prestadores autorizados.\n\nRota operacional desta manhã: 22.º → 30.º → refeitório → 37.º.\n\nEm caso de falha, permanecer na cabine e usar o interfone de emergência.',
        )
        return
      }

      if (id === 'doors') {
        if (game.flags.cafeteria_break_complete) {
          if (!game.flags.elevator_arrived_37) {
            game.triggerHandAction('brace', 520, target, id)
            game.say(game.flags.elevator_ride_to_37_started ? 'Ainda não.' : 'Primeiro seleciono o 37.º.')
            return
          }
          busy.current = true
          game.setFlag('elevator_left_for_floor_37')
          game.triggerHandAction('door', 820, target, id, 'door-handle')
          game.requestAreaTransition('floor-37', 'floor-37-arrival', { x: 0, y: 1.65, z: 4.8, yaw: Math.PI }, 1200)
          return
        }

        if (game.flags.floor30_routine_complete) {
          if (!game.flags.elevator_arrived_cafeteria) {
            game.triggerHandAction('brace', 520, target, id)
            game.say(game.flags.elevator_ride_to_cafeteria_started ? 'Ainda não.' : 'Primeiro seleciono o refeitório.')
            return
          }
          busy.current = true
          game.setFlag('elevator_left_for_cafeteria')
          game.triggerHandAction('door', 820, target, id, 'door-handle')
          game.requestAreaTransition('cafeteria', 'cafeteria-arrival', { x: 0, y: 1.65, z: 5.2, yaw: Math.PI }, 1200)
          return
        }

        if (game.flags.floor22_routine_complete) {
          if (!game.flags.elevator_arrived_30) {
            game.triggerHandAction('brace', 520, target, id)
            game.say(game.flags.elevator_ride_to_30_started ? 'Ainda não.' : 'Primeiro seleciono o 30.º.')
            return
          }
          busy.current = true
          game.setFlag('elevator_left_for_floor_30')
          game.triggerHandAction('door', 820, target, id, 'door-handle')
          game.requestAreaTransition('work-floor-30', 'floor-30-arrival', { x: 0, y: 1.65, z: 4.6, yaw: Math.PI }, 1200)
          return
        }

        if (!game.flags.elevator_arrived_22) {
          game.triggerHandAction('brace', 520, target, id)
          game.say(game.flags.elevator_ride_started ? 'Ainda não.' : 'Primeiro tenho que selecionar o andar.')
          return
        }

        busy.current = true
        game.setFlag('elevator_left_for_floor_22')
        game.triggerHandAction('door', 820, target, id, 'door-handle')
        game.requestAreaTransition('work-floor-22', 'floor-22-arrival', { x: 0, y: 1.65, z: 4.6, yaw: Math.PI }, 1200)
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
      const id = findElevatorInteractable(hit.object)
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
