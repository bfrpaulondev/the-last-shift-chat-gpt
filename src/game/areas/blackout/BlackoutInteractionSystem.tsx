import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../state/gameStore'

const CENTER = new THREE.Vector2(0, 0)
const RANGE = 2.8
const STANDING_SPAWN = { x: 0, y: 1.65, z: 2.2, yaw: Math.PI }
const STAIRWELL_ENTRY_SPAWN = { x: 0, y: 1.65, z: 4.8, yaw: Math.PI }

function findBlackoutInteractable(object: THREE.Object3D | null): string | null {
  let current = object
  while (current) {
    const id = current.userData.blackoutInteractableId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

function promptFor(id: string): string | null {
  if (id === 'brace-point') return '[E] Apoiar-se e levantar'
  if (id === 'emergency-light') return '[E] Ativar luz de emergência'
  if (id === 'elevator-panel') return '[E] Testar painel do elevador'
  if (id === 'fire-door') return '[E] Abrir porta corta-fogo'
  return null
}

export function BlackoutInteractionSystem() {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const currentId = useRef<string | null>(null)
  const point = useRef(new THREE.Vector3())

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
        game.blackout ||
        game.cinematic ||
        game.areaTransition ||
        game.demoEnded
      ) return

      const id = currentId.current
      if (!id) return

      const target: [number, number, number] = [point.current.x, point.current.y, point.current.z]
      const interactionFlag = `blackout_seen_${id}`
      const wasFirstTime = !game.flags[interactionFlag]
      game.logEvent({
        t: performance.now() / 1000,
        type: 'interact',
        objectId: `blackout:${id}`,
        wasFirstTime,
      })
      game.setFlag(interactionFlag)

      if (id === 'brace-point') {
        if (!game.flags.blackout_vision_returned) return
        if (game.flags.blackout_stood_up) {
          game.say('Já consigo ficar de pé.')
          return
        }

        game.triggerHandAction('brace', 1100, target, id)
        game.setFlag('blackout_stood_up')
        game.setCheckpoint('blackout-standing', STANDING_SPAWN)
        game.setObjective('Encontre e ative a luz de emergência.')
        game.say('Devagar... preciso de alguma luz.')
        return
      }

      if (id === 'emergency-light') {
        game.triggerHandAction('press', 760, target, id)
        if (!game.flags.blackout_stood_up) {
          game.say('Preciso conseguir levantar primeiro.')
          return
        }
        if (game.flags.blackout_emergency_light_on) {
          game.say('A luz de emergência ainda está acesa.')
          return
        }

        game.setFlag('blackout_emergency_light_on')
        game.setCheckpoint('blackout-emergency-light', game.location.spawn)
        game.setObjective('Verifique se o elevador de serviço responde.')
        game.say('Só a emergência. O resto morreu.')
        return
      }

      if (id === 'elevator-panel') {
        game.triggerHandAction('press', 760, target, id)
        if (!game.flags.blackout_emergency_light_on) {
          game.say('Não enxergo o painel direito.')
          return
        }
        if (game.flags.blackout_elevator_checked) {
          game.say('Nada. O elevador não responde.')
          return
        }

        game.setFlag('blackout_elevator_checked')
        game.setCheckpoint('blackout-elevator-dead', game.location.spawn)
        game.setObjective('Procure uma saída pelo corredor de emergência.')
        game.say('Sem resposta. Tenho que procurar outra saída.')
        return
      }

      if (id === 'fire-door') {
        game.triggerHandAction('door', 900, target, id, 'door-handle')
        if (!game.flags.blackout_elevator_checked) {
          game.say('Primeiro preciso entender se o elevador ainda funciona.')
          return
        }

        if (!game.flags.blackout_recovery_complete) {
          game.setFlag('blackout_fire_door_reached')
          game.setFlag('blackout_recovery_complete')
          game.setCheckpoint('blackout-recovered', game.location.spawn)
        }
        game.setFlag('blackout_left_for_stairwell')
        game.setObjective('Continue pela rota de emergência.')
        game.say('A escada de emergência. É por aqui.')
        game.requestAreaTransition(
          'emergency-stairwell',
          'stairwell-entry',
          STAIRWELL_ENTRY_SPAWN,
          1100,
        )
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useFrame(() => {
    const game = useGameStore.getState()
    if (
      game.blackout ||
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
      const id = findBlackoutInteractable(hit.object)
      if (!id) continue
      const prompt = promptFor(id)
      if (!prompt) continue
      if (id === 'brace-point' && game.flags.blackout_stood_up) continue
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
